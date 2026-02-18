import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://aymetcmgejdmengvzzob.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjE0OTlkODk4LWUzMmQtNGE4YS04ZmVjLTU1MWYyMTA3OTJlOCJ9.eyJwcm9qZWN0SWQiOiJheW1ldGNtZ2VqZG1lbmd2enpvYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY4MzIwNjQ3LCJleHAiOjIwODM2ODA2NDcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.XFapeJHZCe3r3JdU5IhwlD-P1AYGeJvo4ZOm_s3vKno';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };