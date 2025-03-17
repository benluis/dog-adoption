import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
    createBrowserClient(
        'https://ftpyopsikzrqqcugoize.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cHlvcHNpa3pycXFjdWdvaXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTc2MjgsImV4cCI6MjA1NjU5MzYyOH0.MgoZk-6dzXvaJ9oKcuh8TFQlrh3xRdCoqahrmncdmmc'
    );