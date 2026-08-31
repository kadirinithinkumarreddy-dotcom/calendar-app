import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://gijdosvuwpretxsegolr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpamRvc3Z1d3ByZXR4c2Vnb2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzQ3MDQsImV4cCI6MjEwMzI1MDcwNH0.SR-4WLweFILx-bPpXStG0RMRkFBTOgTEKDzQUqFWGwc';

export const supabase = createClient(supabaseUrl, supabaseKey);
