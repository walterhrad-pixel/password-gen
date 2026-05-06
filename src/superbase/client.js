import { createClient } from '@supabase/supabase-js'

const SUPERBASE_URL = "https://jmmilxfddpwwlpwkfjlz.supabase.co"
const SUPERBASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbWlseGZkZHB3d2xwd2tmamx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTYxMjQsImV4cCI6MjA5MjY5MjEyNH0.SRNHm7K_xoCcSz2A7ZsQu52YgdpIZlqsxjejGdBq6VY"

export const supabase = createClient(SUPERBASE_URL, SUPERBASE_KEY)