import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

/**
 * Import Script: Dungmori CSV to Supabase (Multi-Course Support)
 * 
 * Logic:
 * 1. Read CSV
 * 2. Group records by 'Khóa Học (Gốc)'
 * 3. For each course:
 *    - Create/Get course in DB
 *    - Import lessons for that course
 */

interface CSVRow {
    'Khóa Học (Gốc)': string
    'Mục Lục (Gộp Folder con)': string
    'Tên Bài': string
    'ID File': string
    'Loại File': string
}

async function importDungmoriData() {
    console.log('🚀 Starting Dungmori CSV import (Multi-Course)...')

    // 1. Read & Parse CSV
    const csvPath = path.join(process.cwd(), 'dungmori.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')

    const records: CSVRow[] = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    })

    console.log(`📊 Found total ${records.length} records in CSV`)

    // 2. Group by Course Name
    const coursesMap = new Map<string, CSVRow[]>()

    records.forEach(record => {
        const courseName = record['Khóa Học (Gốc)'] || 'Unknown Course'
        if (!coursesMap.has(courseName)) {
            coursesMap.set(courseName, [])
        }
        coursesMap.get(courseName)?.push(record)
    })

    console.log(`📚 Found ${coursesMap.size} unique courses:`)
    Array.from(coursesMap.keys()).forEach(name => console.log(`   - ${name}`))

    // 3. Setup Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials in .env.local')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 4. Process each course
    for (const [courseName, courseRecords] of coursesMap) {
        console.log(`\n---------------------------------------------------`)
        console.log(`Processing Course: "${courseName}" (${courseRecords.length} lessons)`)

        // Step 4.1: Create or Get Course
        let courseId: number

        const { data: existingCourse } = await supabase
            .from('courses')
            .select('id')
            .eq('title', courseName)
            .single()

        if (existingCourse) {
            courseId = existingCourse.id
            console.log(`   ✅ Course exists with ID: ${courseId}`)
        } else {
            const { data: newCourse, error: courseError } = await supabase
                .from('courses')
                .insert({
                    title: courseName,
                    description: `Khóa học ${courseName}`,
                    thumbnail_url: null,
                })
                .select('id')
                .single()

            if (courseError) {
                console.error(`   ❌ Error creating course "${courseName}":`, courseError.message)
                continue // Skip to next course
            }

            courseId = newCourse.id
            console.log(`   ✅ Created new course with ID: ${courseId}`)
        }

        // Step 4.2: Import Lessons
        let successCount = 0
        let skippedCount = 0
        let errorCount = 0

        // Use a loop to process lessons sequentially to maintain order if needed, 
        // though we use 'lesson_order' field.
        for (let i = 0; i < courseRecords.length; i++) {
            const record = courseRecords[i]
            const lessonOrder = i + 1 // Reset order for each course

            // Determine lesson type
            let lessonType: 'video' | 'pdf' = 'video'
            const fileType = record['Loại File'].toLowerCase()

            if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('docx')) {
                lessonType = 'pdf'
            } else {
                lessonType = 'video' // Default to video for mp4, mp3, etc.
            }

            // Check if lesson exists
            const { data: existingLesson } = await supabase
                .from('lessons')
                .select('id')
                .eq('course_id', courseId)
                .eq('drive_file_id', record['ID File'])
                .single()

            if (existingLesson) {
                // Update section if it's missing or different (optional, but good for re-runs)
                // For now, we just skip to avoid duplicates as per original logic
                skippedCount++
                continue
            }

            // Insert Lesson
            const { error: lessonError } = await supabase
                .from('lessons')
                .insert({
                    course_id: courseId,
                    title: record['Tên Bài'],
                    drive_file_id: record['ID File'],
                    type: lessonType,
                    lesson_order: lessonOrder,
                    section: record['Mục Lục (Gộp Folder con)'], // Save folder structure
                })

            if (lessonError) {
                console.error(`   ❌ Error inserting lesson "${record['Tên Bài']}":`, lessonError.message)
                errorCount++
            } else {
                successCount++
            }

            // Log progress every 50 items
            if ((i + 1) % 50 === 0) {
                process.stdout.write(`   ...processed ${i + 1}/${courseRecords.length}\r`)
            }
        }

        console.log(`   📊 Summary for "${courseName}":`)
        console.log(`      ✅ Imported: ${successCount}`)
        console.log(`      ⏭️  Skipped:  ${skippedCount}`)
        console.log(`      ❌ Errors:   ${errorCount}`)
    }

    console.log(`\n🎉 All imports complete!`)
}

// Run the import
importDungmoriData()
    .then(() => {
        console.log('\n✅ Script finished successfully')
        process.exit(0)
    })
    .catch((error: Error) => {
        console.error('\n❌ Script failed:', error)
        process.exit(1)
    })
