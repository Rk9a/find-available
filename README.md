Abstract:
Find Available is a web-based application designed to help students quickly identify available classrooms within a selected building at KFUPM. The system analyzes publicly available course schedule data and determines room availability based on user-selected day and time intervals.

The application:
	1.	Loads course schedule data from classes.json , gotten from the official registrar website course offering
	2.	Extracts all rooms in a selected building
	3.	Checks for time interval overlap using:
    user_start < class_end AND user_end > class_start
  4.	Removes occupied rooms
	5.	Displays only available rooms

Tech Stack:
  Frontend Framework
	•	Next.js – React framework for production-ready applications
	•	React – Component-based UI library
	•	TypeScript – Strongly typed JavaScript for safer and scalable code

  Styling
	•	CSS Modules – Scoped and modular CSS styling

  Data Handling
	•	JSON Dataset – Course schedule data (classes.json)
	•	Client-side filtering & interval overlap logic

  Deployment
	•	Vercel – Hosting and deployment platform
