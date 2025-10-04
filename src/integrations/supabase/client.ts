import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezymopl1fpsjpklskgodn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eW1vcGxmcHNqcGtsc2tnb2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTY3MDQsImV4cCI6MjA3NTE3MjcwNH0.6duOWbeNFo4Vb28bqIZp1ff4HIAU_YcJpZ8K-iTgLcQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
