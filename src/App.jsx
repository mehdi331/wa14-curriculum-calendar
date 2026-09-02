import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, X, Download, RotateCcw, Users, Clock, Calendar as CalendarIcon, Table as TableIcon, BarChart3, Link as LinkIcon, LogOut, UserPlus, Trash2, ShieldCheck, MessageSquare, Send } from 'lucide-react';
import * as XLSX from 'xlsx';
import { storage, localAuth } from './storage';

const SEED = [{"id":1,"week":0,"date":"2026-10-24","weekday":"Saturday","start":"15:00","end":"15:30","name":"Welcome & Basecamp Arrival","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":2,"week":0,"date":"2026-10-24","weekday":"Saturday","start":"15:30","end":"17:30","name":"WA 14 Opening Ceremony","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":3,"week":0,"date":"2026-10-24","weekday":"Saturday","start":"18:00","end":"19:00","name":"IT Skills 1 - Setup & Onboarding","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":4,"week":0,"date":"2026-10-24","weekday":"Saturday","start":"19:30","end":"20:30","name":"Basecamp House Rules & Onboarding","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":5,"week":0,"date":"2026-10-24","weekday":"Saturday","start":"20:30","end":"21:30","name":"CS, Academy Lead & AFA Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":6,"week":1,"date":"2026-10-25","weekday":"Sunday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":7,"week":1,"date":"2026-10-25","weekday":"Sunday","start":"09:00","end":"10:15","name":"Welcome to Academy (WA 14 Onboarding)","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":8,"week":1,"date":"2026-10-25","weekday":"Sunday","start":"10:30","end":"11:30","name":"Introduction to Journaling","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":9,"week":1,"date":"2026-10-25","weekday":"Sunday","start":"11:45","end":"12:45","name":"WA 14 Content & Curriculum Overview","pillar":"Academic Content","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":10,"week":1,"date":"2026-10-25","weekday":"Sunday","start":"14:00","end":"15:15","name":"WA 14 Vision & Pillars","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":11,"week":1,"date":"2026-10-25","weekday":"Sunday","start":"15:30","end":"16:45","name":"WA 14 Goals & Culture","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":12,"week":1,"date":"2026-10-25","weekday":"Sunday","start":"17:00","end":"18:15","name":"Fellow Reflection & Journal Writing","pillar":"Personal & Prof. Dev.","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":13,"week":1,"date":"2026-10-25","weekday":"Sunday","start":"18:30","end":"19:30","name":"Weekly Fellow Briefing 1","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":14,"week":1,"date":"2026-10-25","weekday":"Sunday","start":"19:30","end":"20:30","name":"Office Hours (Optional Support)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":15,"week":1,"date":"2026-10-26","weekday":"Monday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":16,"week":1,"date":"2026-10-26","weekday":"Monday","start":"09:00","end":"10:15","name":"LC1: The Purpose of LC Space, Who Are We?","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":17,"week":1,"date":"2026-10-26","weekday":"Monday","start":"10:30","end":"11:45","name":"Professional Communication: Email Etiquette","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":18,"week":1,"date":"2026-10-26","weekday":"Monday","start":"12:00","end":"13:30","name":"Core Values of Teach For Bangladesh","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":19,"week":1,"date":"2026-10-26","weekday":"Monday","start":"14:30","end":"16:00","name":"Expectation from Fellows & Confirmation Policy","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":20,"week":1,"date":"2026-10-26","weekday":"Monday","start":"16:15","end":"17:15","name":"Clinic: Tech Support (Optional)","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":21,"week":1,"date":"2026-10-26","weekday":"Monday","start":"17:30","end":"18:30","name":"Fellow Reflection & Journal Writing","pillar":"Personal & Prof. Dev.","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":22,"week":1,"date":"2026-10-26","weekday":"Monday","start":"18:30","end":"19:30","name":"AFA & Curriculum Specialist Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":23,"week":1,"date":"2026-10-27","weekday":"Tuesday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":24,"week":1,"date":"2026-10-27","weekday":"Tuesday","start":"09:00","end":"10:15","name":"Backward Planning Theory & Framework","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":25,"week":1,"date":"2026-10-27","weekday":"Tuesday","start":"10:30","end":"11:45","name":"Lesson Planning for Teachers (The Template)","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":26,"week":1,"date":"2026-10-27","weekday":"Tuesday","start":"12:00","end":"13:00","name":"Blooms Taxonomy & Bloom's Verbs","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":27,"week":1,"date":"2026-10-27","weekday":"Tuesday","start":"14:00","end":"15:30","name":"Learning Outcome Driven Assessment Making","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":28,"week":1,"date":"2026-10-27","weekday":"Tuesday","start":"15:45","end":"17:00","name":"Theory of Problem (ToP) Part 1","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":29,"week":1,"date":"2026-10-27","weekday":"Tuesday","start":"17:15","end":"18:30","name":"Classroom Basics: What to do","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":30,"week":1,"date":"2026-10-27","weekday":"Tuesday","start":"18:30","end":"19:30","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":31,"week":1,"date":"2026-10-28","weekday":"Wednesday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":32,"week":1,"date":"2026-10-28","weekday":"Wednesday","start":"09:00","end":"10:30","name":"Key Points: What, Why & How Key Points","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":33,"week":1,"date":"2026-10-28","weekday":"Wednesday","start":"10:45","end":"11:45","name":"Clinic: Key Point Writing","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":34,"week":1,"date":"2026-10-28","weekday":"Wednesday","start":"12:00","end":"13:15","name":"6 Step Lesson Method Decoded","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":35,"week":1,"date":"2026-10-28","weekday":"Wednesday","start":"14:30","end":"15:45","name":"Phonics: Introduction to Phonics and Reading","pillar":"Academic Content","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":36,"week":1,"date":"2026-10-28","weekday":"Wednesday","start":"16:00","end":"17:15","name":"Theory of Problem (ToP) Part 2","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":37,"week":1,"date":"2026-10-28","weekday":"Wednesday","start":"17:30","end":"18:45","name":"Classroom Basics: 100%","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":38,"week":1,"date":"2026-10-28","weekday":"Wednesday","start":"19:00","end":"20:00","name":"First Weekly Clearing & Group Game","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":39,"week":1,"date":"2026-10-29","weekday":"Thursday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":40,"week":1,"date":"2026-10-29","weekday":"Thursday","start":"09:00","end":"10:30","name":"Clinic: Create Your First Lesson Plan (Math/Eng/Ban)","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":41,"week":1,"date":"2026-10-29","weekday":"Thursday","start":"10:45","end":"12:00","name":"Understanding the Logic Behind Planning Process","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":42,"week":1,"date":"2026-10-29","weekday":"Thursday","start":"12:15","end":"13:30","name":"TFB as an NGO & Educational Ecosystem Overview","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":43,"week":1,"date":"2026-10-29","weekday":"Thursday","start":"14:30","end":"16:00","name":"Building Excellence: Average vs. Excellence","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":44,"week":1,"date":"2026-10-29","weekday":"Thursday","start":"16:15","end":"17:30","name":"LC2: Exploring my Life Journey: Who Am I? (Life Map)","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":45,"week":1,"date":"2026-10-29","weekday":"Thursday","start":"17:30","end":"18:30","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":46,"week":2,"date":"2026-10-31","weekday":"Saturday","start":"09:00","end":"09:30","name":"Daily Central Huddle & Community Prep","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":47,"week":2,"date":"2026-10-31","weekday":"Saturday","start":"09:30","end":"10:30","name":"Connect with a Child: Framing & Prep","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":48,"week":2,"date":"2026-10-31","weekday":"Saturday","start":"10:45","end":"11:15","name":"Travel to Community Placement Sites","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":49,"week":2,"date":"2026-10-31","weekday":"Saturday","start":"11:15","end":"12:30","name":"Connect with a Child: Community Execution","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":50,"week":2,"date":"2026-10-31","weekday":"Saturday","start":"12:30","end":"13:15","name":"Travel back to Basecamp (BLC)","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":51,"week":2,"date":"2026-10-31","weekday":"Saturday","start":"13:15","end":"14:00","name":"Lunch Break","pillar":"Meal / Break","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":52,"week":2,"date":"2026-10-31","weekday":"Saturday","start":"14:00","end":"15:15","name":"Connect with a Child: Debrief & Reflection","pillar":"System Inequity","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":53,"week":2,"date":"2026-10-31","weekday":"Saturday","start":"15:30","end":"17:00","name":"CMIP: Classroom Management Investment Plan (Concept)","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":54,"week":2,"date":"2026-10-31","weekday":"Saturday","start":"17:15","end":"20:15","name":"CMIP Clinic: Design and Draft Classroom Rules","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":55,"week":2,"date":"2026-10-31","weekday":"Saturday","start":"20:30","end":"21:30","name":"Weekly Fellow Briefing 2","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":56,"week":2,"date":"2026-11-01","weekday":"Sunday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":57,"week":2,"date":"2026-11-01","weekday":"Sunday","start":"09:00","end":"10:30","name":"Subject Specific Pedagogy: Mathematics (Primary-CPA)","pillar":"Academic Content","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":58,"week":2,"date":"2026-11-01","weekday":"Sunday","start":"09:00","end":"10:30","name":"Subject Specific Pedagogy: Mathematics (Secondary-Authentic)","pillar":"Academic Content","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":59,"week":2,"date":"2026-11-01","weekday":"Sunday","start":"10:45","end":"12:00","name":"Clinic: Math Lesson Planning & Resource Modeling","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":60,"week":2,"date":"2026-11-01","weekday":"Sunday","start":"12:15","end":"13:45","name":"Reading Strategies as part of Balanced Literacy","pillar":"Academic Content","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":61,"week":2,"date":"2026-11-01","weekday":"Sunday","start":"14:45","end":"16:15","name":"Student Outcomes Framework at TFB","pillar":"Academic Content","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":62,"week":2,"date":"2026-11-01","weekday":"Sunday","start":"16:30","end":"17:45","name":"Introduction to Community Project","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":63,"week":2,"date":"2026-11-01","weekday":"Sunday","start":"17:45","end":"18:45","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":64,"week":2,"date":"2026-11-02","weekday":"Monday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":65,"week":2,"date":"2026-11-02","weekday":"Monday","start":"09:00","end":"10:00","name":"Yellow Hat Framing: The Power of Positive Thinking","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":66,"week":2,"date":"2026-11-02","weekday":"Monday","start":"10:15","end":"11:30","name":"Yellow Hat Execution: Role Play & Boundary Pushing","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":67,"week":2,"date":"2026-11-02","weekday":"Monday","start":"11:45","end":"13:00","name":"Yellow Hat Reflection & Fellowship Connection","pillar":"Personal & Prof. Dev.","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":68,"week":2,"date":"2026-11-02","weekday":"Monday","start":"14:00","end":"15:15","name":"LC3: What is my Purpose?","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":69,"week":2,"date":"2026-11-02","weekday":"Monday","start":"15:30","end":"16:45","name":"Community Project: Feel (Empathy & Need Analysis)","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":70,"week":2,"date":"2026-11-02","weekday":"Monday","start":"17:00","end":"18:00","name":"Work time: Finalize Batch 1 LP 2","pillar":"Teaching Skills","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":71,"week":2,"date":"2026-11-02","weekday":"Monday","start":"18:00","end":"19:00","name":"AFA Office Hours (SOP & Mentorship Support)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":72,"week":2,"date":"2026-11-03","weekday":"Tuesday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":73,"week":2,"date":"2026-11-03","weekday":"Tuesday","start":"09:00","end":"10:30","name":"Classroom Basics: Positive Framing & Precise Praise","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":74,"week":2,"date":"2026-11-03","weekday":"Tuesday","start":"10:45","end":"12:00","name":"Classroom Basics: Wait Time","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":75,"week":2,"date":"2026-11-03","weekday":"Tuesday","start":"12:15","end":"13:45","name":"Growth Mindset: Theoretical Framework & Classroom","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":76,"week":2,"date":"2026-11-03","weekday":"Tuesday","start":"14:45","end":"16:00","name":"Lesson Vision Workshop: Objectives & SAR","pillar":"Teaching Skills","mode":"Workshop","facilitators":[],"calendared":true,"resources":[]},{"id":77,"week":2,"date":"2026-11-03","weekday":"Tuesday","start":"16:15","end":"17:30","name":"Growth Mindset - Identifying growth mindset within","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":78,"week":2,"date":"2026-11-03","weekday":"Tuesday","start":"17:30","end":"18:30","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":79,"week":2,"date":"2026-11-04","weekday":"Wednesday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":80,"week":2,"date":"2026-11-04","weekday":"Wednesday","start":"09:00","end":"10:30","name":"Subject Specific Pedagogy: English","pillar":"Academic Content","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":81,"week":2,"date":"2026-11-04","weekday":"Wednesday","start":"10:45","end":"12:00","name":"Clinic: English Lesson Planning (CPA & Gradual Release)","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":82,"week":2,"date":"2026-11-04","weekday":"Wednesday","start":"12:15","end":"13:30","name":"LC4: What do I know about student community?","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":83,"week":2,"date":"2026-11-04","weekday":"Wednesday","start":"14:30","end":"15:45","name":"Introduction to Central Dashboard & Tech Onboarding","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":84,"week":2,"date":"2026-11-04","weekday":"Wednesday","start":"16:00","end":"17:15","name":"Optional (Need-Based Math/Eng Clinic)","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":85,"week":2,"date":"2026-11-04","weekday":"Wednesday","start":"17:15","end":"18:15","name":"Curriculum Specialists Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":86,"week":2,"date":"2026-11-05","weekday":"Thursday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":87,"week":2,"date":"2026-11-05","weekday":"Thursday","start":"09:00","end":"10:30","name":"Subject Specific Pedagogy: Bangla","pillar":"Academic Content","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":88,"week":2,"date":"2026-11-05","weekday":"Thursday","start":"10:45","end":"12:00","name":"Clinic: Bangla Lesson Planning","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":89,"week":2,"date":"2026-11-05","weekday":"Thursday","start":"12:15","end":"13:30","name":"Optional session: Learn from an Alum","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":90,"week":2,"date":"2026-11-05","weekday":"Thursday","start":"14:30","end":"15:45","name":"Classroom Basics: 100% and Wait Time Practice","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":91,"week":2,"date":"2026-11-05","weekday":"Thursday","start":"16:00","end":"17:15","name":"Week 2 Clearing Conversation & Goal Check","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":92,"week":2,"date":"2026-11-05","weekday":"Thursday","start":"17:15","end":"18:15","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":93,"week":3,"date":"2026-11-07","weekday":"Saturday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":94,"week":3,"date":"2026-11-07","weekday":"Saturday","start":"09:00","end":"10:00","name":"Service Day: Framing and Prep","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":95,"week":3,"date":"2026-11-07","weekday":"Saturday","start":"10:15","end":"13:15","name":"Service Day Execution Block","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":96,"week":3,"date":"2026-11-07","weekday":"Saturday","start":"13:15","end":"14:15","name":"Lunch & Community Rest","pillar":"Meal / Break","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":97,"week":3,"date":"2026-11-07","weekday":"Saturday","start":"14:15","end":"15:45","name":"Service Day: Reflection & Debrief","pillar":"Team Culture","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":98,"week":3,"date":"2026-11-07","weekday":"Saturday","start":"16:00","end":"17:00","name":"Weekly Fellow Briefing 3","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":99,"week":3,"date":"2026-11-07","weekday":"Saturday","start":"17:00","end":"18:00","name":"SP&O & AFA Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":100,"week":3,"date":"2026-11-08","weekday":"Sunday","start":"08:00","end":"13:00","name":"In-person Class & Practice Teaching: Day 1","pillar":"Practice Teaching","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":101,"week":3,"date":"2026-11-08","weekday":"Sunday","start":"13:00","end":"14:00","name":"Travel back to Basecamp / Debriefs","pillar":"Debrief","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":102,"week":3,"date":"2026-11-08","weekday":"Sunday","start":"15:00","end":"16:15","name":"Reflection: My First Day as Teacher in the Classroom","pillar":"Debrief","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":103,"week":3,"date":"2026-11-08","weekday":"Sunday","start":"16:30","end":"18:30","name":"Theory of Change: Where Do We Begin?","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":104,"week":3,"date":"2026-11-08","weekday":"Sunday","start":"18:45","end":"20:00","name":"Work time: LP Feedback and Daily Post-Task","pillar":"Teaching Skills","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":105,"week":3,"date":"2026-11-08","weekday":"Sunday","start":"20:00","end":"21:00","name":"Curriculum Specialist Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":106,"week":3,"date":"2026-11-09","weekday":"Monday","start":"08:00","end":"13:00","name":"In-person Class & Practice Teaching: Day 2","pillar":"Practice Teaching","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":107,"week":3,"date":"2026-11-09","weekday":"Monday","start":"13:00","end":"14:00","name":"Travel back to Basecamp / Debriefs","pillar":"Debrief","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":108,"week":3,"date":"2026-11-09","weekday":"Monday","start":"15:00","end":"16:15","name":"Teach Like A Champion (TLAC): Practical Execution","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":109,"week":3,"date":"2026-11-09","weekday":"Monday","start":"16:30","end":"18:00","name":"Theory of Change: Power & Privileges","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":110,"week":3,"date":"2026-11-09","weekday":"Monday","start":"18:15","end":"19:30","name":"LC5: Who are My People?","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":111,"week":3,"date":"2026-11-09","weekday":"Monday","start":"19:30","end":"20:30","name":"AFA & SP&O Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":112,"week":3,"date":"2026-11-10","weekday":"Tuesday","start":"08:00","end":"13:00","name":"In-person Class & Practice Teaching: Day 3","pillar":"Practice Teaching","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":113,"week":3,"date":"2026-11-10","weekday":"Tuesday","start":"13:00","end":"14:00","name":"Travel back to Basecamp / Debriefs","pillar":"Debrief","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":114,"week":3,"date":"2026-11-10","weekday":"Tuesday","start":"15:00","end":"16:15","name":"Subject Pedagogy Deep Dive: Writing","pillar":"Academic Content","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":115,"week":3,"date":"2026-11-10","weekday":"Tuesday","start":"16:30","end":"17:30","name":"TLAC: CFU, No opt out, Right is right","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":116,"week":3,"date":"2026-11-10","weekday":"Tuesday","start":"17:45","end":"19:00","name":"Mid-Academy Leadership Conversation (Intro)","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":117,"week":3,"date":"2026-11-10","weekday":"Tuesday","start":"19:00","end":"20:00","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":118,"week":3,"date":"2026-11-11","weekday":"Wednesday","start":"08:00","end":"13:00","name":"In-person Class & Practice Teaching: Day 4","pillar":"Practice Teaching","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":119,"week":3,"date":"2026-11-11","weekday":"Wednesday","start":"13:00","end":"14:00","name":"Travel back to Basecamp / Debriefs","pillar":"Debrief","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":120,"week":3,"date":"2026-11-11","weekday":"Wednesday","start":"15:00","end":"16:15","name":"Data Tracking & Data Driven Decision (Introduction)","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":121,"week":3,"date":"2026-11-11","weekday":"Wednesday","start":"16:30","end":"17:45","name":"Data Tracking (Personal Work Time with Live Data)","pillar":"Teaching Skills","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":122,"week":3,"date":"2026-11-11","weekday":"Wednesday","start":"18:00","end":"19:15","name":"Data Tracking & Data Driven Decision (Closing Loop)","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":123,"week":3,"date":"2026-11-11","weekday":"Wednesday","start":"19:30","end":"20:45","name":"LC6: What are my Values?","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":124,"week":3,"date":"2026-11-11","weekday":"Wednesday","start":"20:45","end":"21:45","name":"CS Office Hours: Data Analytics Help","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":125,"week":3,"date":"2026-11-12","weekday":"Thursday","start":"08:00","end":"13:00","name":"In-person Class & Practice Teaching: Day 5","pillar":"Practice Teaching","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":126,"week":3,"date":"2026-11-12","weekday":"Thursday","start":"13:00","end":"14:00","name":"Travel back to Basecamp / Debriefs","pillar":"Debrief","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":127,"week":3,"date":"2026-11-12","weekday":"Thursday","start":"15:00","end":"16:00","name":"Mid-Academy Leadership Reflection & Debrief Session","pillar":"Personal & Prof. Dev.","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":128,"week":3,"date":"2026-11-12","weekday":"Thursday","start":"16:15","end":"17:45","name":"WA 14 Town Hall & Open Forum","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":129,"week":3,"date":"2026-11-12","weekday":"Thursday","start":"18:00","end":"19:30","name":"The Diversity Walk Session","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":130,"week":3,"date":"2026-11-12","weekday":"Thursday","start":"19:30","end":"20:30","name":"Office Hours (Optional Support)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":131,"week":4,"date":"2026-11-14","weekday":"Saturday","start":"13:00","end":"14:30","name":"LC7: What are my biases?","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":132,"week":4,"date":"2026-11-14","weekday":"Saturday","start":"14:45","end":"16:00","name":"CMIP Re-alignment: Troubleshooting Classroom Behavior","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":133,"week":4,"date":"2026-11-14","weekday":"Saturday","start":"16:15","end":"17:45","name":"Inspired Speaker Series: Network Learning 1","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":134,"week":4,"date":"2026-11-14","weekday":"Saturday","start":"18:00","end":"19:30","name":"Inspired Speaker Series: Network Learning 2","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":135,"week":4,"date":"2026-11-14","weekday":"Saturday","start":"19:30","end":"20:30","name":"Weekly Fellow Briefing 4","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":136,"week":4,"date":"2026-11-14","weekday":"Saturday","start":"20:30","end":"21:30","name":"AFA & SP&O Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":137,"week":4,"date":"2026-11-15","weekday":"Sunday","start":"08:00","end":"13:00","name":"In-person Class & Practice Teaching: Day 6","pillar":"Practice Teaching","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":138,"week":4,"date":"2026-11-15","weekday":"Sunday","start":"13:00","end":"14:00","name":"Travel back to Basecamp / Debriefs","pillar":"Debrief","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":139,"week":4,"date":"2026-11-15","weekday":"Sunday","start":"15:00","end":"16:15","name":"Community Project: Proposal Template & Planning","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":140,"week":4,"date":"2026-11-15","weekday":"Sunday","start":"16:30","end":"18:00","name":"Collab Community Project Preparation","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":141,"week":4,"date":"2026-11-15","weekday":"Sunday","start":"18:00","end":"19:00","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":142,"week":4,"date":"2026-11-16","weekday":"Monday","start":"08:00","end":"13:00","name":"In-person Class & Practice Teaching: Day 7","pillar":"Practice Teaching","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":143,"week":4,"date":"2026-11-16","weekday":"Monday","start":"13:00","end":"14:00","name":"Travel back to Basecamp / Debriefs","pillar":"Debrief","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":144,"week":4,"date":"2026-11-16","weekday":"Monday","start":"15:00","end":"16:15","name":"LC8: What limits me?","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":145,"week":4,"date":"2026-11-16","weekday":"Monday","start":"16:30","end":"17:45","name":"Community Project Proposal Workshop","pillar":"System Inequity","mode":"Workshop","facilitators":[],"calendared":true,"resources":[]},{"id":146,"week":4,"date":"2026-11-16","weekday":"Monday","start":"18:00","end":"19:15","name":"Inspired Speaker Series: Network Learning 3","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":147,"week":4,"date":"2026-11-16","weekday":"Monday","start":"19:15","end":"20:15","name":"AFA Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":148,"week":4,"date":"2026-11-17","weekday":"Tuesday","start":"08:00","end":"13:00","name":"In-person Class & Practice Teaching: Day 8","pillar":"Practice Teaching","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":149,"week":4,"date":"2026-11-17","weekday":"Tuesday","start":"13:00","end":"14:00","name":"Travel back to Basecamp / Debriefs","pillar":"Debrief","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":150,"week":4,"date":"2026-11-17","weekday":"Tuesday","start":"15:00","end":"16:30","name":"Diversity, Equity, and Inclusiveness (DEI)","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":151,"week":4,"date":"2026-11-17","weekday":"Tuesday","start":"16:45","end":"17:45","name":"Work Time: Community Project Pitch Prep","pillar":"System Inequity","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":152,"week":4,"date":"2026-11-17","weekday":"Tuesday","start":"18:00","end":"19:15","name":"Progress Check Lesson Plan Workshop","pillar":"Teaching Skills","mode":"Workshop","facilitators":[],"calendared":true,"resources":[]},{"id":153,"week":4,"date":"2026-11-17","weekday":"Tuesday","start":"19:15","end":"20:15","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":154,"week":4,"date":"2026-11-18","weekday":"Wednesday","start":"08:00","end":"13:00","name":"In-person Class & Practice Teaching: Day 9","pillar":"Practice Teaching","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":155,"week":4,"date":"2026-11-18","weekday":"Wednesday","start":"13:00","end":"14:00","name":"Travel back to Basecamp / Debriefs","pillar":"Debrief","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":156,"week":4,"date":"2026-11-18","weekday":"Wednesday","start":"15:00","end":"18:00","name":"Community Project: Implementation Block (The 'Do')","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":157,"week":4,"date":"2026-11-18","weekday":"Wednesday","start":"18:15","end":"21:15","name":"Community Engagement & Project Execution Debrief","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":158,"week":4,"date":"2026-11-18","weekday":"Wednesday","start":"21:15","end":"22:15","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":159,"week":4,"date":"2026-11-19","weekday":"Thursday","start":"08:00","end":"13:00","name":"In-person Class & Practice Teaching: Day 10","pillar":"Practice Teaching","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":160,"week":4,"date":"2026-11-19","weekday":"Thursday","start":"13:00","end":"14:00","name":"Travel back to Basecamp / Debriefs","pillar":"Debrief","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":161,"week":4,"date":"2026-11-19","weekday":"Thursday","start":"15:00","end":"16:30","name":"Inspired Speaker Series: Network Learning 4","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":162,"week":4,"date":"2026-11-19","weekday":"Thursday","start":"16:45","end":"17:45","name":"End of Practice Teaching Celebration & Clearing","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":163,"week":4,"date":"2026-11-19","weekday":"Thursday","start":"18:00","end":"19:30","name":"Power of Gratitude: The Giving Tree","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":164,"week":4,"date":"2026-11-19","weekday":"Thursday","start":"19:30","end":"20:30","name":"Office Hours (Optional Support)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":165,"week":5,"date":"2026-11-21","weekday":"Saturday","start":"13:00","end":"14:30","name":"Introduction to School Placement & Regions","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":166,"week":5,"date":"2026-11-21","weekday":"Saturday","start":"14:45","end":"17:45","name":"School Placement Form Filling & Consultation","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":167,"week":5,"date":"2026-11-21","weekday":"Saturday","start":"18:00","end":"19:00","name":"Weekly Fellow Briefing 5","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":168,"week":5,"date":"2026-11-21","weekday":"Saturday","start":"19:00","end":"20:00","name":"SP&O Team Placement Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":169,"week":5,"date":"2026-11-22","weekday":"Sunday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":170,"week":5,"date":"2026-11-22","weekday":"Sunday","start":"09:00","end":"10:15","name":"Balanced Literacy: Advanced Instruction Models","pillar":"Academic Content","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":171,"week":5,"date":"2026-11-22","weekday":"Sunday","start":"10:30","end":"12:00","name":"Trauma-informed practices (Session 01)","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":172,"week":5,"date":"2026-11-22","weekday":"Sunday","start":"12:15","end":"13:30","name":"Social Media Communication Norms & Guidelines","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":173,"week":5,"date":"2026-11-22","weekday":"Sunday","start":"14:30","end":"16:00","name":"Internet Safety for Kids & Parental Control","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":174,"week":5,"date":"2026-11-22","weekday":"Sunday","start":"16:15","end":"17:45","name":"Consolidation of Academy assessment (Prep)","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":175,"week":5,"date":"2026-11-22","weekday":"Sunday","start":"17:45","end":"18:45","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":176,"week":5,"date":"2026-11-23","weekday":"Monday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":177,"week":5,"date":"2026-11-23","weekday":"Monday","start":"09:00","end":"10:30","name":"Blended Learning: Framework and Practice","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":178,"week":5,"date":"2026-11-23","weekday":"Monday","start":"10:45","end":"12:15","name":"Fellow Health Insurance Policies","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":179,"week":5,"date":"2026-11-23","weekday":"Monday","start":"12:30","end":"13:45","name":"LC9: What will keep me going?","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":180,"week":5,"date":"2026-11-23","weekday":"Monday","start":"14:45","end":"16:00","name":"Decoding School Eco-system & Relationship Mgt","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":181,"week":5,"date":"2026-11-23","weekday":"Monday","start":"16:15","end":"17:15","name":"Ghost Night / Social Games Night (Optional)","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":182,"week":5,"date":"2026-11-23","weekday":"Monday","start":"17:15","end":"18:15","name":"AFA Office Hours (Pastoral & Support Session)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":183,"week":5,"date":"2026-11-24","weekday":"Tuesday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":184,"week":5,"date":"2026-11-24","weekday":"Tuesday","start":"09:00","end":"10:15","name":"Understanding Stakeholders: Govt Stakeholder Series","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":185,"week":5,"date":"2026-11-24","weekday":"Tuesday","start":"10:30","end":"12:00","name":"Professional Wellbeing & Stress Management","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":186,"week":5,"date":"2026-11-24","weekday":"Tuesday","start":"12:15","end":"13:30","name":"Futures of Education","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":187,"week":5,"date":"2026-11-24","weekday":"Tuesday","start":"14:30","end":"16:00","name":"Reimagining Education System with Stakeholders","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":188,"week":5,"date":"2026-11-24","weekday":"Tuesday","start":"16:15","end":"17:30","name":"Work time: Portfolio Compilation","pillar":"Teaching Skills","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":189,"week":5,"date":"2026-11-24","weekday":"Tuesday","start":"17:45","end":"19:15","name":"TFB Olympics: Collaborative Team Event","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":190,"week":5,"date":"2026-11-24","weekday":"Tuesday","start":"19:15","end":"20:15","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":191,"week":5,"date":"2026-11-25","weekday":"Wednesday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":192,"week":5,"date":"2026-11-25","weekday":"Wednesday","start":"09:00","end":"10:30","name":"Classroom Basics Clinic: Wait Time & 100% Retest","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":193,"week":5,"date":"2026-11-25","weekday":"Wednesday","start":"10:45","end":"12:00","name":"Lesson Vision Workshop: Retest & Quality Alignment","pillar":"Teaching Skills","mode":"Workshop","facilitators":[],"calendared":true,"resources":[]},{"id":194,"week":5,"date":"2026-11-25","weekday":"Wednesday","start":"12:15","end":"13:30","name":"Work time: Mid-Academy Reflection Prep","pillar":"Personal & Prof. Dev.","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":195,"week":5,"date":"2026-11-25","weekday":"Wednesday","start":"14:30","end":"15:45","name":"Saturday Debrief: Mid-Academy Reflection (Framing)","pillar":"Personal & Prof. Dev.","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":196,"week":5,"date":"2026-11-25","weekday":"Wednesday","start":"16:00","end":"17:00","name":"Final Prep: Region-Wise Unit Planning","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":197,"week":5,"date":"2026-11-25","weekday":"Wednesday","start":"17:15","end":"18:30","name":"Adda Space & Cultural Prep (Optional)","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":198,"week":5,"date":"2026-11-25","weekday":"Wednesday","start":"18:30","end":"19:30","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":199,"week":5,"date":"2026-11-26","weekday":"Thursday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":200,"week":5,"date":"2026-11-26","weekday":"Thursday","start":"09:00","end":"10:30","name":"Consolidation of Academy assessment (Submission)","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":201,"week":5,"date":"2026-11-26","weekday":"Thursday","start":"10:45","end":"12:00","name":"Headteacher Engagement Strategies","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":202,"week":5,"date":"2026-11-26","weekday":"Thursday","start":"12:15","end":"13:30","name":"Govt Stakeholders Series: DG DPE Panel","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":203,"week":5,"date":"2026-11-26","weekday":"Thursday","start":"14:30","end":"19:00","name":"Teach For Bangladesh Day (The Grand Celebration)","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":204,"week":5,"date":"2026-11-26","weekday":"Thursday","start":"19:00","end":"20:00","name":"Office Hours (Optional Support)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":205,"week":6,"date":"2026-11-28","weekday":"Saturday","start":"13:00","end":"14:30","name":"2026 School Placement & Region Announcement","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":206,"week":6,"date":"2026-11-28","weekday":"Saturday","start":"14:45","end":"17:45","name":"School Placement Office Hour (One-on-One)","pillar":"Team Culture","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":207,"week":6,"date":"2026-11-28","weekday":"Saturday","start":"18:00","end":"19:00","name":"Weekly Fellow Briefing 6 (Final Briefing)","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":208,"week":6,"date":"2026-11-28","weekday":"Saturday","start":"19:00","end":"20:00","name":"SP&O & AFA Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":209,"week":6,"date":"2026-11-29","weekday":"Sunday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":210,"week":6,"date":"2026-11-29","weekday":"Sunday","start":"09:00","end":"10:15","name":"SMART Goals Based on TOC","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":211,"week":6,"date":"2026-11-29","weekday":"Sunday","start":"10:30","end":"11:45","name":"Introduction to City Planning & Relocation Guide","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":212,"week":6,"date":"2026-11-29","weekday":"Sunday","start":"12:00","end":"13:15","name":"Introduction to Unit Plan","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":213,"week":6,"date":"2026-11-29","weekday":"Sunday","start":"14:30","end":"16:00","name":"Sync: Unit Plan Curriculum Mapping","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":214,"week":6,"date":"2026-11-29","weekday":"Sunday","start":"16:15","end":"17:30","name":"Unit Plan Curriculum Mapping Clinic","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":215,"week":6,"date":"2026-11-29","weekday":"Sunday","start":"17:30","end":"18:30","name":"Unit Planning Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":216,"week":6,"date":"2026-11-30","weekday":"Monday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":217,"week":6,"date":"2026-11-30","weekday":"Monday","start":"09:00","end":"10:15","name":"Unit Plan Assessment Making","pillar":"Teaching Skills","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":218,"week":6,"date":"2026-11-30","weekday":"Monday","start":"10:30","end":"11:45","name":"Clinic: Unit 01 Assessment & Draft Plan","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":219,"week":6,"date":"2026-11-30","weekday":"Monday","start":"12:00","end":"13:15","name":"Theory of Change: Approaching the Achievement Gap","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":220,"week":6,"date":"2026-11-30","weekday":"Monday","start":"14:30","end":"15:45","name":"LC9: What will keep me going?","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":221,"week":6,"date":"2026-11-30","weekday":"Monday","start":"16:00","end":"17:15","name":"Adda Space / Bonding Activity (Optional)","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":222,"week":6,"date":"2026-11-30","weekday":"Monday","start":"17:15","end":"18:15","name":"Office Hours (Optional)","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":223,"week":6,"date":"2026-12-01","weekday":"Tuesday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":224,"week":6,"date":"2026-12-01","weekday":"Tuesday","start":"09:00","end":"10:15","name":"LC: How am I operating? (Year 1 Prep)","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":225,"week":6,"date":"2026-12-01","weekday":"Tuesday","start":"10:30","end":"11:45","name":"Clinic: Unit Plan (Feedback and Peer Review)","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":226,"week":6,"date":"2026-12-01","weekday":"Tuesday","start":"12:00","end":"13:15","name":"Clinic: Unit Plan (Update & Polish)","pillar":"Teaching Skills","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":227,"week":6,"date":"2026-12-01","weekday":"Tuesday","start":"14:30","end":"16:00","name":"Child Protection Policy Session","pillar":"System Inequity","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":228,"week":6,"date":"2026-12-01","weekday":"Tuesday","start":"16:15","end":"17:15","name":"Story of Us Preparation Space","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":229,"week":6,"date":"2026-12-01","weekday":"Tuesday","start":"17:15","end":"18:15","name":"Final Unit Plan Submission & Office Hours","pillar":"Team Support","mode":"Coaching","facilitators":[],"calendared":true,"resources":[]},{"id":230,"week":6,"date":"2026-12-02","weekday":"Wednesday","start":"08:30","end":"09:00","name":"Daily Central Huddle","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":231,"week":6,"date":"2026-12-02","weekday":"Wednesday","start":"09:00","end":"10:15","name":"Open Forum with CEO (Q&A)","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":232,"week":6,"date":"2026-12-02","weekday":"Wednesday","start":"10:30","end":"13:30","name":"LC10: Story of Us (The Final Huddle)","pillar":"Learning Circle","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":233,"week":6,"date":"2026-12-02","weekday":"Wednesday","start":"14:30","end":"17:00","name":"WA 14 Closing Ceremony","pillar":"Team Culture","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":234,"week":6,"date":"2026-12-01","weekday":"Tuesday","start":"18:30","end":"19:45","name":"AI For Educators - Sync","pillar":"Personal & Prof. Dev.","mode":"Sync","facilitators":[],"calendared":true,"resources":[]},{"id":235,"week":6,"date":"2026-12-01","weekday":"Tuesday","start":"19:45","end":"20:00","name":"AI For Educators - Async","pillar":"Personal & Prof. Dev.","mode":"Async","facilitators":[],"calendared":true,"resources":[]},{"id":236,"week":null,"date":null,"weekday":null,"start":null,"end":null,"name":"AI For Educators - Workshop (deprioritized / TBD)","pillar":"Personal & Prof. Dev.","mode":"Workshop","facilitators":[],"calendared":false,"resources":[]}];

const PILLARS = [
  'Team Culture','Personal & Prof. Dev.','Team Support','Academic Content',
  'Learning Circle','Teaching Skills','System Inequity','Meal / Break',
  'Practice Teaching','Debrief'
];
const PILLAR_COLOR = {
  'Team Culture':'#E8B23D','Personal & Prof. Dev.':'#8A96A3','Team Support':'#5FA97E',
  'Academic Content':'#D97355','Learning Circle':'#8A78C2','Teaching Skills':'#3E8FA0',
  'System Inequity':'#C79236','Meal / Break':'#C9CDD2','Practice Teaching':'#D786A8',
  'Debrief':'#A6ABB2'
};
const MODES = ['Sync','Async','Coaching','Workshop'];
const MODE_COLOR = { Sync:'#1F6F78', Async:'#B8863B', Coaching:'#6B5CA5', Workshop:'#A64D4D' };
const RESOURCE_KINDS = ['Session plan','Slides','Async work','Exit ticket','Other'];
const WEEKS = [0,1,2,3,4,5,6];
const GRID_START = 8*60;
const GRID_END = 22*60+30;
const PX_PER_MIN = 0.95;

// ---- Access rule ---------------------------------------------------------
// Staff / planners use single-word emails: name@teachforbangladesh.org
// Fellows use two-part emails:            firstname.lastname@teachforbangladesh.org
// mehdi@teachforbangladesh.org is the permanent Superadmin — always full
// access, and the only one who can add/remove other Planners. Any other
// single-word TFB email is either a Planner (if added to the Planner list)
// or plain Staff (read-only calendar, no roster needed). Fellows need to be
// added to the Fellow list before they can sign in at all.
// NOTE: this is a client-side convenience gate, not real authentication —
// anyone who reads this source can see the logic. It stops casual/accidental
// access, not a determined bad actor. Real access control needs a backend.
const STAFF_EMAIL_RE = /^[a-z]+@teachforbangladesh\.org$/i;
const FELLOW_EMAIL_RE = /^[a-z]+\.[a-z]+@teachforbangladesh\.org$/i;
const SUPERADMIN_EMAIL = 'mehdi@teachforbangladesh.org';

const ROLE_LABEL = { superadmin:'Superadmin', planner:'Planning team', staff:'Staff', fellow:'Fellow' };

function toMin(t){ if(!t) return null; const [h,m]=t.split(':').map(Number); return h*60+m; }
function fmtDur(mins){
  if (mins==null || isNaN(mins)) return '—';
  const h = Math.floor(mins/60), m = mins%60;
  if (h===0) return m+'m';
  if (m===0) return h+'h';
  return h+'h '+m+'m';
}
function dateLabel(d){
  if(!d) return 'Unscheduled';
  const dt = new Date(d+'T00:00:00');
  return dt.toLocaleDateString(undefined,{month:'short',day:'numeric'});
}
function fmtWhen(iso){
  const dt = new Date(iso);
  return dt.toLocaleDateString(undefined,{month:'short',day:'numeric'}) + ' · ' + dt.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
}

let uid = 10000;
function newId(){ return uid++; }
function newResId(){ return 'r'+(uid++); }

const FONT = "-apple-system, 'Inter', 'Segoe UI', sans-serif";

export default function App(){
  const [auth, setAuth] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const a = localAuth.get();
    if (a) setAuth(a);
    setAuthLoaded(true);
  }, []);

  const handleLogin = (a) => { setAuth(a); localAuth.set(a); };
  const handleLogout = () => { setAuth(null); localAuth.clear(); };

  if (!authLoaded) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'400px',color:'#8A96A3',fontFamily:FONT}}>Loading…</div>;
  if (!auth) return <LoginGate onLogin={handleLogin} />;
  return <MainApp auth={auth} onLogout={handleLogout} />;
}

async function resolveRole(emailRaw){
  const em = (emailRaw||'').trim().toLowerCase();
  if (em === SUPERADMIN_EMAIL) return { ok:true, email:em, role:'superadmin' };

  if (STAFF_EMAIL_RE.test(em)) {
    try {
      const res = await storage.get('wa14-planners');
      const planners = res && res.value ? JSON.parse(res.value) : [];
      const match = planners.find(p => p.email.toLowerCase()===em);
      if (match) return { ok:true, email:em, role:'planner', name:match.name };
    } catch (e) {}
    return { ok:true, email:em, role:'staff' };
  }

  if (FELLOW_EMAIL_RE.test(em)) {
    try {
      const res = await storage.get('wa14-roster');
      const roster = res && res.value ? JSON.parse(res.value) : [];
      const match = roster.find(r => r.email.toLowerCase()===em);
      if (match) return { ok:true, email:em, role:'fellow', name:match.name };
    } catch (e) { return { ok:false, error:'Could not verify right now — please try again.' }; }
    return { ok:false, error:"This email isn't on the approved Fellow list yet. Ask a planner to add it." };
  }

  return { ok:false, error:'Enter a valid @teachforbangladesh.org email — staff use name@teachforbangladesh.org, Fellows use firstname.lastname@teachforbangladesh.org.' };
}

function LoginGate({ onLogin }){
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setChecking(true);
    const result = await resolveRole(email);
    setChecking(false);
    if (result.ok) onLogin({ email: result.email, role: result.role, name: result.name });
    else setError(result.error);
  };

  return (
    <div style={{fontFamily:FONT, minHeight:'480px', display:'flex', alignItems:'center', justifyContent:'center', background:'#EFF3F4'}}>
      <form onSubmit={submit} style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:10, padding:32, width:340, maxWidth:'88vw'}}>
        <div style={{fontWeight:700, fontSize:17, marginBottom:4}}>WA 14 Calendar</div>
        <div style={{fontSize:12.5, color:'#8A96A3', marginBottom:20}}>Sign in with your Teach For Bangladesh email.</div>

        <div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Email</div>
        <input
          type="email" autoFocus value={email} onChange={e=>{setEmail(e.target.value); setError('');}}
          placeholder="name@teachforbangladesh.org"
          style={{width:'100%', padding:'9px 10px', borderRadius:6, border:'1px solid #C9CDD2', fontSize:13.5, boxSizing:'border-box', marginBottom:8}}
        />
        {error && <div style={{color:'#B84C4C', fontSize:12, marginBottom:10, lineHeight:1.4}}>{error}</div>}
        <button type="submit" disabled={checking} style={{...btnPrimary, width:'100%', justifyContent:'center', padding:'10px', marginTop:6, opacity:checking?0.6:1}}>
          {checking ? 'Checking…' : 'Continue'}
        </button>
        <div style={{fontSize:11, color:'#9AA5B1', marginTop:14, lineHeight:1.5}}>
          Staff (name@teachforbangladesh.org) get read-only calendar access automatically.
          Fellows (firstname.lastname@teachforbangladesh.org) need to be added to the Fellow list first.
        </div>
      </form>
    </div>
  );
}

function MainApp({ auth, onLogout }){
  const isSuperadmin = auth.role === 'superadmin';
  const isAdmin = isSuperadmin || auth.role === 'planner';
  const isViewer = !isAdmin; // staff or fellow — read-only

  const [sessions, setSessions] = useState(null);
  const [roster, setRoster] = useState(null);       // fellows
  const [planners, setPlanners] = useState(null);
  const [requests, setRequests] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('calendar');
  const [activeWeek, setActiveWeek] = useState(0);
  const [hiddenDays, setHiddenDays] = useState({});
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [weekFilter, setWeekFilter] = useState('all');
  const [pillarFilter, setPillarFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [toast, setToast] = useState('');
  const saveTimer = useRef(null);
  const rosterSaveTimer = useRef(null);
  const plannerSaveTimer = useRef(null);
  const requestSaveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try { const r = await storage.get('wa14-sessions'); setSessions(r && r.value ? JSON.parse(r.value) : SEED); }
      catch (e) { setSessions(SEED); }
      try { const r = await storage.get('wa14-roster'); setRoster(r && r.value ? JSON.parse(r.value) : []); }
      catch (e) { setRoster([]); }
      try { const r = await storage.get('wa14-planners'); setPlanners(r && r.value ? JSON.parse(r.value) : []); }
      catch (e) { setPlanners([]); }
      try { const r = await storage.get('wa14-requests'); setRequests(r && r.value ? JSON.parse(r.value) : []); }
      catch (e) { setRequests([]); }
      setLoaded(true);
    })();
  }, []);

  const debouncedPersist = (setter, timerRef, key) => (next) => {
    setter(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try { await storage.set(key, JSON.stringify(next)); }
      catch (e) { console.error('save failed', key, e); }
    }, 250);
  };
  const persist = debouncedPersist(setSessions, saveTimer, 'wa14-sessions');
  const persistRoster = debouncedPersist(setRoster, rosterSaveTimer, 'wa14-roster');
  const persistPlanners = debouncedPersist(setPlanners, plannerSaveTimer, 'wa14-planners');
  const persistRequests = debouncedPersist(setRequests, requestSaveTimer, 'wa14-requests');

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''), 2200); };

  const saveSession = (s) => {
    const next = sessions.find(x=>x.id===s.id) ? sessions.map(x => x.id===s.id ? s : x) : [...sessions, s];
    persist(next); setEditing(null); showToast('Session saved');
  };
  const deleteSession = (id) => { persist(sessions.filter(x=>x.id!==id)); setEditing(null); showToast('Session removed'); };
  const resetSeed = () => {
    if (!window.confirm('Reset all sessions back to the original WA14 schedule? Your edits will be lost.')) return;
    persist(SEED); showToast('Reset to original schedule');
  };
  const exportExcel = async () => {
    const rows = sessions.map(s => ({
      Week: s.week!=null ? 'Week '+String(s.week).padStart(2,'0') : '',
      Date: s.date || '', Weekday: s.weekday || '', Start: s.start || '', End: s.end || '',
      'Duration (min)': (s.start && s.end) ? (toMin(s.end)-toMin(s.start)) : '',
      'Session Name': s.name, Pillar: s.pillar, Mode: s.mode,
      Facilitators: (s.facilitators||[]).join(', '),
      Resources: (s.resources||[]).map(r=>r.label+': '+r.url).join(' | '),
      Calendared: s.calendared ? 'Yes' : 'No',
    }));
    rows.sort((a,b) => (a.Date||'zzzz').localeCompare(b.Date||'zzzz') || (a.Start||'').localeCompare(b.Start||''));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{wch:9},{wch:12},{wch:11},{wch:7},{wch:7},{wch:10},{wch:42},{wch:20},{wch:11},{wch:22},{wch:40},{wch:10}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sessions');
    XLSX.writeFile(wb, 'WA14_Sessions_Export.xlsx');
    showToast('Exported to Excel');
  };

  const requestUpdate = (req) => {
    const entry = { id:'req'+Date.now(), ...req, createdAt:new Date().toISOString(), resolved:false };
    persistRequests([...(requests||[]), entry]);
    showToast('Request sent to the planning team');
  };
  const resolveRequest = (id, resolved) => persistRequests(requests.map(r => r.id===id ? {...r, resolved} : r));
  const deleteRequest = (id) => persistRequests(requests.filter(r=>r.id!==id));

  const filtered = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter(s => (pillarFilter==='all' || s.pillar===pillarFilter) && (modeFilter==='all' || s.mode===modeFilter));
  }, [sessions, pillarFilter, modeFilter]);

  const openRequests = (requests||[]).filter(r=>!r.resolved).length;

  if (!loaded || !sessions || !roster || !planners || !requests) {
    return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'400px',color:'#8A96A3',fontFamily:FONT}}>Loading schedule…</div>;
  }

  return (
    <div style={{fontFamily:FONT, background:'#EFF3F4', minHeight:'600px', color:'#1B2733'}}>
      <TopBar
        tab={tab} setTab={setTab} isAdmin={isAdmin} isSuperadmin={isSuperadmin} auth={auth} onLogout={onLogout}
        onExport={exportExcel} onReset={resetSeed} onAdd={()=>setEditing('new')} openRequests={openRequests}
      />
      {toast && <div style={toastStyle}>{toast}</div>}
      <div style={{padding:'20px 24px 40px'}}>
        {(tab==='calendar' || tab==='sessions') && (
          <FilterBar pillarFilter={pillarFilter} setPillarFilter={setPillarFilter} modeFilter={modeFilter} setModeFilter={setModeFilter} />
        )}

        {tab==='calendar' && (
          <CalendarView
            sessions={filtered} activeWeek={activeWeek} setActiveWeek={setActiveWeek}
            hiddenDays={hiddenDays} setHiddenDays={setHiddenDays}
            onSelect={isAdmin ? setEditing : setViewing}
          />
        )}
        {tab==='sessions' && isAdmin && (
          <SessionsTable sessions={filtered} weekFilter={weekFilter} setWeekFilter={setWeekFilter} onEdit={setEditing} onDelete={deleteSession} />
        )}
        {tab==='summary' && isAdmin && <TimeSummary sessions={filtered} />}
        {tab==='fellows' && isAdmin && <RosterPanel roster={roster} onChange={persistRoster} showToast={showToast} />}
        {tab==='planners' && isSuperadmin && <PlannerPanel planners={planners} onChange={persistPlanners} showToast={showToast} />}
        {tab==='requests' && isAdmin && <RequestsPanel requests={requests} onResolve={resolveRequest} onDelete={deleteRequest} />}
      </div>

      {isAdmin && editing && (
        <EditPanel session={editing==='new' ? blankSession() : editing} onSave={saveSession} onDelete={editing!=='new' ? deleteSession : null} onClose={()=>setEditing(null)} />
      )}
      {isViewer && viewing && <ViewPanel session={viewing} auth={auth} onRequestUpdate={requestUpdate} onClose={()=>setViewing(null)} />}
    </div>
  );
}

function blankSession(){
  return { id:newId(), week:0, date:'', weekday:'', start:'', end:'', name:'', pillar:PILLARS[0], mode:'Sync', facilitators:[], resources:[], calendared:false };
}

const toastStyle = { position:'fixed', top:16, right:24, background:'#1B2733', color:'#fff', padding:'9px 16px', borderRadius:6, fontSize:13, zIndex:200, boxShadow:'0 4px 14px rgba(0,0,0,.2)' };

function TopBar({ tab, setTab, isAdmin, isSuperadmin, auth, onLogout, onExport, onReset, onAdd, openRequests }){
  const tabs = [
    {id:'calendar', label:'Calendar', icon:CalendarIcon},
    ...(isAdmin ? [
      {id:'sessions', label:'Sessions', icon:TableIcon},
      {id:'summary', label:'Time Summary', icon:BarChart3},
      {id:'fellows', label:'Fellows', icon:UserPlus},
      {id:'requests', label:'Requests'+(openRequests?' ('+openRequests+')':''), icon:MessageSquare},
    ] : []),
    ...(isSuperadmin ? [{id:'planners', label:'Planners', icon:ShieldCheck}] : []),
  ];
  return (
    <div style={{background:'#FFFFFF', borderBottom:'1px solid #DDE2E6', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12}}>
      <div style={{display:'flex', alignItems:'center', gap:24, flexWrap:'wrap'}}>
        <div style={{fontWeight:700, fontSize:16, padding:'16px 0', letterSpacing:'-0.01em'}}>WA 14 Curriculum &amp; Calendar</div>
        <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
          {tabs.map(t => {
            const Icon = t.icon; const active = tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                display:'flex', alignItems:'center', gap:6, border:'none', background:'none',
                padding:'16px 12px', borderBottom: active ? '2px solid #1F6F78' : '2px solid transparent',
                color: active ? '#1F6F78' : '#5B6672', fontWeight: active?600:500, fontSize:14, cursor:'pointer'
              }}><Icon size={15}/> {t.label}</button>
            );
          })}
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:14, padding:'12px 0'}}>
        {isAdmin && tab!=='fellows' && tab!=='planners' && tab!=='requests' && (
          <div style={{display:'flex', gap:8}}>
            <button onClick={onAdd} style={btnPrimary}><Plus size={14}/> Add session</button>
            <button onClick={onExport} style={btnSecondary}><Download size={14}/> Export Excel</button>
            <button onClick={onReset} style={btnGhost}><RotateCcw size={14}/> Reset</button>
          </div>
        )}
        <div style={{display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#8A96A3', borderLeft:'1px solid #EEF0F2', paddingLeft:14}}>
          <span>{auth.email} · {ROLE_LABEL[auth.role]}</span>
          <button onClick={onLogout} title="Switch user" style={{background:'none', border:'none', cursor:'pointer', color:'#8A96A3', display:'flex'}}><LogOut size={14}/></button>
        </div>
      </div>
    </div>
  );
}

const btnBase = {display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,borderRadius:6,padding:'8px 12px',cursor:'pointer',border:'1px solid transparent'};
const btnPrimary = {...btnBase, background:'#1F6F78', color:'#fff'};
const btnSecondary = {...btnBase, background:'#fff', color:'#1B2733', border:'1px solid #C9CDD2'};
const btnGhost = {...btnBase, background:'none', color:'#5B6672'};
const selectStyle = {padding:'6px 10px', borderRadius:6, border:'1px solid #C9CDD2', fontSize:13, background:'#fff'};

function FilterBar({ pillarFilter, setPillarFilter, modeFilter, setModeFilter }){
  return (
    <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16, flexWrap:'wrap'}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{fontSize:12.5, color:'#5B6672'}}>Pillar</span>
        <select value={pillarFilter} onChange={e=>setPillarFilter(e.target.value)} style={selectStyle}>
          <option value="all">All pillars</option>{PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{fontSize:12.5, color:'#5B6672'}}>Mode</span>
        <select value={modeFilter} onChange={e=>setModeFilter(e.target.value)} style={selectStyle}>
          <option value="all">All modes</option>{MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {(pillarFilter!=='all' || modeFilter!=='all') && (
        <button onClick={()=>{setPillarFilter('all'); setModeFilter('all');}} style={{...btnGhost, padding:'4px 8px', fontSize:12}}>Clear filters</button>
      )}
    </div>
  );
}

function CalendarView({ sessions, activeWeek, setActiveWeek, hiddenDays, setHiddenDays, onSelect }){
  const weekSessions = sessions.filter(s => s.week===activeWeek && s.date);
  const daysMap = {};
  weekSessions.forEach(s => { if(!daysMap[s.date]) daysMap[s.date]=s.weekday; });
  const days = Object.entries(daysMap).sort((a,b)=>a[0].localeCompare(b[0]));
  const visibleDays = days.filter(([d]) => !hiddenDays[d]);
  const hours = [];
  for (let m=GRID_START; m<=GRID_END; m+=60) hours.push(m);
  const totalHeight = (GRID_END-GRID_START)*PX_PER_MIN;

  return (
    <div>
      <div style={{display:'flex', gap:6, marginBottom:14, flexWrap:'wrap'}}>
        {WEEKS.map(w => (
          <button key={w} onClick={()=>setActiveWeek(w)} style={{
            padding:'7px 14px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer',
            border: activeWeek===w ? '1px solid #1F6F78' : '1px solid #C9CDD2',
            background: activeWeek===w ? '#1F6F78' : '#fff', color: activeWeek===w ? '#fff' : '#5B6672'
          }}>Week {String(w).padStart(2,'0')}</button>
        ))}
      </div>
      {days.length>1 && (
        <div style={{display:'flex', gap:14, marginBottom:12, flexWrap:'wrap'}}>
          {days.map(([d,wd]) => (
            <label key={d} style={{display:'flex', alignItems:'center', gap:6, fontSize:12.5, color:'#5B6672', cursor:'pointer'}}>
              <input type="checkbox" checked={!hiddenDays[d]} onChange={()=>setHiddenDays(h=>({...h,[d]:!h[d]}))} />
              {wd}, {dateLabel(d)}
            </label>
          ))}
        </div>
      )}
      {weekSessions.length===0 ? (
        <div style={{padding:'60px 0', textAlign:'center', color:'#8A96A3', fontSize:14}}>No sessions match the current filters this week.</div>
      ) : (
        <div style={{display:'flex', gap:0, background:'#fff', borderRadius:8, border:'1px solid #DDE2E6', overflow:'hidden'}}>
          <div style={{width:56, flexShrink:0, borderRight:'1px solid #EEF0F2', position:'relative', height:totalHeight}}>
            {hours.map(m => (<div key={m} style={{position:'absolute', top:(m-GRID_START)*PX_PER_MIN-6, right:8, fontSize:10.5, color:'#9AA5B1'}}>{String(Math.floor(m/60)).padStart(2,'0')}:00</div>))}
          </div>
          {visibleDays.map(([d,wd]) => {
            const daySessions = weekSessions.filter(s=>s.date===d).sort((a,b)=>toMin(a.start)-toMin(b.start));
            return (
              <div key={d} style={{flex:1, minWidth:150, borderRight:'1px solid #EEF0F2', position:'relative'}}>
                <div style={{padding:'10px 10px', borderBottom:'1px solid #EEF0F2', background:'#F7F8F9', fontSize:12.5, fontWeight:600, textAlign:'center'}}>
                  {wd}<div style={{fontWeight:400, color:'#8A96A3', fontSize:11}}>{dateLabel(d)}</div>
                </div>
                <div style={{position:'relative', height:totalHeight}}>
                  {hours.map(m => (<div key={m} style={{position:'absolute', top:(m-GRID_START)*PX_PER_MIN, left:0, right:0, borderTop:'1px solid #F2F3F4'}} />))}
                  {daySessions.map(s => {
                    const start = toMin(s.start), end = toMin(s.end);
                    const top = (start-GRID_START)*PX_PER_MIN;
                    const height = Math.max((end-start)*PX_PER_MIN, 16);
                    const color = PILLAR_COLOR[s.pillar] || '#C9CDD2';
                    return (
                      <div key={s.id} onClick={()=>onSelect(s)} style={{
                        position:'absolute', top, left:3, right:3, height, background: color+'26', borderLeft:'3px solid '+color,
                        borderRadius:4, padding:'3px 6px', cursor:'pointer', overflow:'hidden', fontSize:10.5, lineHeight:1.25
                      }} title={s.name}>
                        <div style={{fontWeight:600, color:'#1B2733'}}>{s.name}</div>
                        {height>28 && <div style={{color:'#5B6672'}}>{s.start}–{s.end}</div>}
                        {height>42 && s.facilitators && s.facilitators.length>0 && (
                          <div style={{color:'#5B6672', display:'flex', alignItems:'center', gap:3, marginTop:1}}><Users size={9}/> {s.facilitators.join(', ')}</div>
                        )}
                        {height>56 && s.resources && s.resources.length>0 && (
                          <div style={{color:'#5B6672', display:'flex', alignItems:'center', gap:3, marginTop:1}}><LinkIcon size={9}/> {s.resources.length} resource{s.resources.length>1?'s':''}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SessionsTable({ sessions, weekFilter, setWeekFilter, onEdit, onDelete }){
  const rows = useMemo(() => {
    let r = sessions.slice();
    if (weekFilter!=='all') r = r.filter(s => weekFilter==='unscheduled' ? s.week==null : s.week===Number(weekFilter));
    r.sort((a,b) => (a.date||'zzzz').localeCompare(b.date||'zzzz') || (toMin(a.start)||9999)-(toMin(b.start)||9999));
    return r;
  }, [sessions, weekFilter]);

  return (
    <div>
      <div style={{marginBottom:14, display:'flex', alignItems:'center', gap:10}}>
        <span style={{fontSize:13, color:'#5B6672'}}>Week</span>
        <select value={weekFilter} onChange={e=>setWeekFilter(e.target.value)} style={selectStyle}>
          <option value="all">All weeks</option>{WEEKS.map(w => <option key={w} value={w}>Week {String(w).padStart(2,'0')}</option>)}<option value="unscheduled">Unscheduled</option>
        </select>
        <span style={{fontSize:12.5, color:'#8A96A3'}}>{rows.length} sessions</span>
      </div>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, overflow:'hidden'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
          <thead><tr style={{background:'#F7F8F9', textAlign:'left'}}>{['Date','Time','Session','Pillar','Mode','Facilitators','Resources',''].map(h => (<th key={h} style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>{h}</th>))}</tr></thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.id} style={{borderBottom:'1px solid #EEF0F2'}}>
                <td style={{padding:'8px 12px', color:'#5B6672', whiteSpace:'nowrap'}}>{s.date ? dateLabel(s.date) : '—'}</td>
                <td style={{padding:'8px 12px', color:'#5B6672', whiteSpace:'nowrap'}}>{s.start ? s.start+'–'+s.end : '—'}</td>
                <td style={{padding:'8px 12px', fontWeight:500, cursor:'pointer'}} onClick={()=>onEdit(s)}>{s.name || '(untitled)'}</td>
                <td style={{padding:'8px 12px'}}><span style={{fontSize:11, padding:'2px 8px', borderRadius:12, background:(PILLAR_COLOR[s.pillar]||'#ccc')+'26', color:'#1B2733'}}>{s.pillar}</span></td>
                <td style={{padding:'8px 12px'}}><span style={{fontSize:11, padding:'2px 8px', borderRadius:12, background:(MODE_COLOR[s.mode]||'#ccc')+'26', color:MODE_COLOR[s.mode]||'#1B2733', fontWeight:600}}>{s.mode}</span></td>
                <td style={{padding:'8px 12px', color:'#5B6672'}}>{(s.facilitators||[]).join(', ') || '—'}</td>
                <td style={{padding:'8px 12px', color:'#5B6672'}}>{(s.resources||[]).length || '—'}</td>
                <td style={{padding:'8px 12px', textAlign:'right', whiteSpace:'nowrap'}}>
                  <button onClick={()=>onEdit(s)} style={linkBtn}>Edit</button>
                  <button onClick={()=>{ if(window.confirm('Delete this session?')) onDelete(s.id); }} style={{...linkBtn, color:'#B84C4C', marginLeft:10}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const linkBtn = {background:'none', border:'none', color:'#1F6F78', fontSize:12.5, fontWeight:600, cursor:'pointer', padding:0};

function TimeSummary({ sessions }){
  const scheduled = sessions.filter(s => s.calendared && s.start && s.end && s.week!=null);
  const byMode = {}; MODES.forEach(m => byMode[m] = {total:0, byWeek:{}});
  scheduled.forEach(s => {
    const dur = toMin(s.end)-toMin(s.start);
    const m = MODES.includes(s.mode) ? s.mode : 'Sync';
    byMode[m].total += dur; byMode[m].byWeek[s.week] = (byMode[m].byWeek[s.week]||0) + dur;
  });
  const grandTotal = MODES.reduce((sum,m)=>sum+byMode[m].total,0);
  const unscheduled = sessions.filter(s => !s.calendared || !s.date);

  return (
    <div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:12, marginBottom:24}}>
        {MODES.map(m => (
          <div key={m} style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, padding:'16px 18px'}}>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}><div style={{width:8, height:8, borderRadius:'50%', background:MODE_COLOR[m]}} /><span style={{fontSize:12.5, color:'#5B6672', fontWeight:600}}>{m}</span></div>
            <div style={{fontSize:24, fontWeight:700}}>{fmtDur(byMode[m].total)}</div>
          </div>
        ))}
        <div style={{background:'#1B2733', borderRadius:8, padding:'16px 18px', color:'#fff'}}>
          <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}><Clock size={13}/><span style={{fontSize:12.5, fontWeight:600}}>Total scheduled</span></div>
          <div style={{fontSize:24, fontWeight:700}}>{fmtDur(grandTotal)}</div>
        </div>
      </div>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, overflow:'hidden', marginBottom:24}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
          <thead><tr style={{background:'#F7F8F9'}}><th style={{padding:'9px 12px', textAlign:'left', color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Mode</th>{WEEKS.map(w => <th key={w} style={{padding:'9px 10px', color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>W{String(w).padStart(2,'0')}</th>)}<th style={{padding:'9px 12px', color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Total</th></tr></thead>
          <tbody>
            {MODES.map(m => (
              <tr key={m} style={{borderBottom:'1px solid #EEF0F2'}}>
                <td style={{padding:'8px 12px', fontWeight:600, color:MODE_COLOR[m]}}>{m}</td>
                {WEEKS.map(w => <td key={w} style={{padding:'8px 10px', textAlign:'center', color:'#5B6672'}}>{fmtDur(byMode[m].byWeek[w]||0)}</td>)}
                <td style={{padding:'8px 12px', textAlign:'center', fontWeight:600}}>{fmtDur(byMode[m].total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {unscheduled.length>0 && (
        <div>
          <div style={{fontSize:13, fontWeight:600, marginBottom:8, color:'#5B6672'}}>Not yet scheduled ({unscheduled.length})</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:8}}>{unscheduled.map(s => (<div key={s.id} style={{fontSize:12, padding:'6px 10px', background:'#fff', border:'1px dashed #C9CDD2', borderRadius:6, color:'#5B6672'}}>{s.name}</div>))}</div>
        </div>
      )}
    </div>
  );
}

function ViewPanel({ session, auth, onRequestUpdate, onClose }){
  const color = PILLAR_COLOR[session.pillar] || '#C9CDD2';
  const [reqOpen, setReqOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const submitRequest = () => {
    if (!msg.trim()) return;
    onRequestUpdate({ sessionId:session.id, sessionName:session.name, requesterEmail:auth.email, requesterRole:auth.role, message:msg.trim() });
    setSent(true); setMsg(''); setTimeout(()=>{setReqOpen(false); setSent(false);}, 1500);
  };

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(27,39,51,0.4)', display:'flex', justifyContent:'flex-end', zIndex:100}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:360, maxWidth:'92vw', background:'#fff', height:'100%', overflowY:'auto', padding:22, boxShadow:'-8px 0 24px rgba(0,0,0,.12)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
          <div style={{fontWeight:700, fontSize:16, lineHeight:1.3}}>{session.name}</div>
          <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', color:'#8A96A3', flexShrink:0}}><X size={18}/></button>
        </div>
        <div style={{display:'flex', gap:8, marginBottom:16, flexWrap:'wrap'}}>
          <span style={{fontSize:11.5, padding:'3px 10px', borderRadius:12, background:color+'26', color:'#1B2733', fontWeight:600}}>{session.pillar}</span>
          <span style={{fontSize:11.5, padding:'3px 10px', borderRadius:12, background:(MODE_COLOR[session.mode]||'#ccc')+'26', color:MODE_COLOR[session.mode], fontWeight:600}}>{session.mode}</span>
        </div>
        <DetailRow label="When">{session.date ? dateLabel(session.date)+' · '+session.weekday : 'Unscheduled'}</DetailRow>
        <DetailRow label="Time">{session.start ? session.start+' – '+session.end : '—'}</DetailRow>
        <DetailRow label="Facilitators">{(session.facilitators||[]).length ? session.facilitators.join(', ') : '—'}</DetailRow>

        {session.resources && session.resources.length>0 && (
          <div style={{marginTop:18}}>
            <div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:8}}>Resources</div>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {session.resources.map(r => (
                <a key={r.id} href={r.url} target="_blank" rel="noreferrer" style={{display:'flex', alignItems:'center', gap:8, padding:'8px 10px', border:'1px solid #DDE2E6', borderRadius:6, fontSize:12.5, color:'#1F6F78', textDecoration:'none'}}>
                  <LinkIcon size={13}/> <span style={{fontWeight:600}}>{r.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div style={{marginTop:22, paddingTop:18, borderTop:'1px solid #EEF0F2'}}>
          {!reqOpen ? (
            <button onClick={()=>setReqOpen(true)} style={{...btnSecondary, width:'100%', justifyContent:'center'}}><MessageSquare size={14}/> Request an update</button>
          ) : sent ? (
            <div style={{fontSize:12.5, color:'#1F6F78', textAlign:'center', padding:'8px 0'}}>Request sent — thanks!</div>
          ) : (
            <div>
              <div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:6}}>What needs updating?</div>
              <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} placeholder="e.g. The exit ticket link is broken, or the time has changed…" style={{...inputStyle, resize:'vertical'}} />
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button onClick={submitRequest} style={{...btnPrimary, flex:1, justifyContent:'center'}}><Send size={13}/> Send request</button>
                <button onClick={()=>{setReqOpen(false); setMsg('');}} style={btnGhost}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }){
  return (<div style={{marginBottom:12}}><div style={{fontSize:11.5, color:'#8A96A3', marginBottom:2}}>{label}</div><div style={{fontSize:13.5, color:'#1B2733'}}>{children}</div></div>);
}

function RosterPanel({ roster, onChange, showToast }){
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [error, setError] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false); const [bulkText, setBulkText] = useState('');

  const addOne = (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!name.trim()) { setError('Enter a name.'); return; }
    if (!FELLOW_EMAIL_RE.test(em)) { setError('Email must look like firstname.lastname@teachforbangladesh.org'); return; }
    if (roster.some(r => r.email.toLowerCase()===em)) { setError('That email is already on the roster.'); return; }
    onChange([...roster, { id: 'f'+Date.now(), name: name.trim(), email: em }]);
    setName(''); setEmail(''); setError(''); showToast('Fellow added');
  };
  const removeOne = (id) => { onChange(roster.filter(r=>r.id!==id)); showToast('Fellow removed'); };
  const importBulk = () => {
    const lines = bulkText.split('\n').map(l=>l.trim()).filter(Boolean);
    let added = 0, skipped = 0; const next = [...roster];
    lines.forEach(line => {
      const parts = line.split(',').map(p=>p.trim());
      if (parts.length < 2) { skipped++; return; }
      const [nm, em] = parts; const emLower = em.toLowerCase();
      if (!FELLOW_EMAIL_RE.test(emLower) || next.some(r=>r.email.toLowerCase()===emLower)) { skipped++; return; }
      next.push({ id: 'f'+Date.now()+added, name: nm, email: emLower }); added++;
    });
    onChange(next); setBulkText(''); setBulkOpen(false);
    showToast(added+' added'+(skipped?', '+skipped+' skipped':''));
  };
  const sorted = roster.slice().sort((a,b)=>a.name.localeCompare(b.name));

  return (
    <div>
      <div style={{marginBottom:6, fontSize:13, color:'#5B6672'}}>Only emails on this list can sign in as a Fellow.</div>
      <div style={{fontSize:12.5, color:'#8A96A3', marginBottom:18}}>{roster.length} Fellow{roster.length!==1?'s':''} on the roster</div>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, padding:18, marginBottom:20, maxWidth:520}}>
        <form onSubmit={addOne} style={{display:'flex', gap:8, alignItems:'flex-end', flexWrap:'wrap'}}>
          <div style={{flex:'1 1 160px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Name</div><input style={inputStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="Fellow's full name" /></div>
          <div style={{flex:'1 1 220px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Email</div><input style={inputStyle} value={email} onChange={e=>setEmail(e.target.value)} placeholder="firstname.lastname@teachforbangladesh.org" /></div>
          <button type="submit" style={{...btnPrimary, height:35}}><Plus size={14}/> Add</button>
        </form>
        {error && <div style={{color:'#B84C4C', fontSize:12, marginTop:8}}>{error}</div>}
        <button onClick={()=>setBulkOpen(o=>!o)} style={{...btnGhost, padding:'4px 0', marginTop:14, fontSize:12.5}}>{bulkOpen ? 'Hide bulk import' : 'Bulk import (paste a list)'}</button>
        {bulkOpen && (
          <div style={{marginTop:10}}>
            <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} placeholder="One Fellow per line: Full Name, firstname.lastname@teachforbangladesh.org" rows={5} style={{...inputStyle, resize:'vertical', fontFamily:'monospace', fontSize:12}} />
            <button onClick={importBulk} style={{...btnSecondary, marginTop:8}}>Import list</button>
          </div>
        )}
      </div>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, overflow:'hidden', maxWidth:520}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
          <thead><tr style={{background:'#F7F8F9', textAlign:'left'}}><th style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Name</th><th style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Email</th><th style={{padding:'9px 12px', borderBottom:'1px solid #DDE2E6'}}></th></tr></thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.id} style={{borderBottom:'1px solid #EEF0F2'}}>
                <td style={{padding:'8px 12px'}}>{r.name}</td><td style={{padding:'8px 12px', color:'#5B6672'}}>{r.email}</td>
                <td style={{padding:'8px 12px', textAlign:'right'}}><button onClick={()=>removeOne(r.id)} style={{background:'none', border:'none', color:'#B84C4C', cursor:'pointer', display:'flex', marginLeft:'auto'}}><Trash2 size={14}/></button></td>
              </tr>
            ))}
            {sorted.length===0 && (<tr><td colSpan={3} style={{padding:'20px 12px', textAlign:'center', color:'#8A96A3'}}>No Fellows added yet.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlannerPanel({ planners, onChange, showToast }){
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [error, setError] = useState('');

  const addOne = (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!name.trim()) { setError('Enter a name.'); return; }
    if (!STAFF_EMAIL_RE.test(em)) { setError('Email must look like name@teachforbangladesh.org'); return; }
    if (em === SUPERADMIN_EMAIL) { setError('That address is already the built-in Superadmin.'); return; }
    if (planners.some(p => p.email.toLowerCase()===em)) { setError('That email is already a Planner.'); return; }
    onChange([...planners, { id:'p'+Date.now(), name:name.trim(), email:em }]);
    setName(''); setEmail(''); setError(''); showToast('Planner added');
  };
  const removeOne = (id) => { onChange(planners.filter(p=>p.id!==id)); showToast('Planner removed'); };
  const sorted = planners.slice().sort((a,b)=>a.name.localeCompare(b.name));

  return (
    <div>
      <div style={{marginBottom:18, fontSize:13, color:'#5B6672', maxWidth:520}}>
        Planners get full edit access — sessions, resources, and the Fellow roster. Only the Superadmin can add or remove Planners.
      </div>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, padding:'12px 16px', marginBottom:16, maxWidth:520, display:'flex', alignItems:'center', gap:10}}>
        <ShieldCheck size={16} color="#1F6F78" />
        <div>
          <div style={{fontSize:13, fontWeight:600}}>{SUPERADMIN_EMAIL}</div>
          <div style={{fontSize:11.5, color:'#8A96A3'}}>Superadmin · built-in, can't be removed</div>
        </div>
      </div>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, padding:18, marginBottom:20, maxWidth:520}}>
        <form onSubmit={addOne} style={{display:'flex', gap:8, alignItems:'flex-end', flexWrap:'wrap'}}>
          <div style={{flex:'1 1 160px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Name</div><input style={inputStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="Planner's full name" /></div>
          <div style={{flex:'1 1 220px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Email</div><input style={inputStyle} value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@teachforbangladesh.org" /></div>
          <button type="submit" style={{...btnPrimary, height:35}}><Plus size={14}/> Add</button>
        </form>
        {error && <div style={{color:'#B84C4C', fontSize:12, marginTop:8}}>{error}</div>}
      </div>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, overflow:'hidden', maxWidth:520}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
          <thead><tr style={{background:'#F7F8F9', textAlign:'left'}}><th style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Name</th><th style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Email</th><th style={{padding:'9px 12px', borderBottom:'1px solid #DDE2E6'}}></th></tr></thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.id} style={{borderBottom:'1px solid #EEF0F2'}}>
                <td style={{padding:'8px 12px'}}>{p.name}</td><td style={{padding:'8px 12px', color:'#5B6672'}}>{p.email}</td>
                <td style={{padding:'8px 12px', textAlign:'right'}}><button onClick={()=>removeOne(p.id)} style={{background:'none', border:'none', color:'#B84C4C', cursor:'pointer', display:'flex', marginLeft:'auto'}}><Trash2 size={14}/></button></td>
              </tr>
            ))}
            {sorted.length===0 && (<tr><td colSpan={3} style={{padding:'20px 12px', textAlign:'center', color:'#8A96A3'}}>No additional Planners yet.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RequestsPanel({ requests, onResolve, onDelete }){
  const sorted = requests.slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
  return (
    <div>
      <div style={{fontSize:12.5, color:'#8A96A3', marginBottom:16}}>{requests.filter(r=>!r.resolved).length} open · {requests.length} total</div>
      {sorted.length===0 ? (
        <div style={{padding:'40px 0', textAlign:'center', color:'#8A96A3', fontSize:14}}>No update requests yet.</div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:10, maxWidth:640}}>
          {sorted.map(r => (
            <div key={r.id} style={{background:'#fff', border:'1px solid '+(r.resolved?'#DDE2E6':'#E0B98C'), borderRadius:8, padding:14, opacity:r.resolved?0.65:1}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
                <div>
                  <div style={{fontWeight:600, fontSize:13.5}}>{r.sessionName}</div>
                  <div style={{fontSize:11.5, color:'#8A96A3', marginTop:2}}>{r.requesterEmail} ({ROLE_LABEL[r.requesterRole]||r.requesterRole}) · {fmtWhen(r.createdAt)}</div>
                </div>
                <div style={{display:'flex', gap:6, flexShrink:0}}>
                  <button onClick={()=>onResolve(r.id, !r.resolved)} style={{...btnGhost, fontSize:11.5, padding:'4px 8px'}}>{r.resolved ? 'Reopen' : 'Mark resolved'}</button>
                  <button onClick={()=>onDelete(r.id)} style={{background:'none', border:'none', color:'#B84C4C', cursor:'pointer', display:'flex'}}><Trash2 size={14}/></button>
                </div>
              </div>
              <div style={{fontSize:13, marginTop:8, color:'#1B2733', lineHeight:1.4}}>{r.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditPanel({ session, onSave, onDelete, onClose }){
  const [form, setForm] = useState({ ...session, facilitatorsText:(session.facilitators||[]).join(', '), resources: session.resources ? session.resources.map(r=>({...r})) : [] });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const addResource = () => set('resources', [...form.resources, {id:newResId(), label:RESOURCE_KINDS[0], url:''}]);
  const updateResource = (id, key, val) => set('resources', form.resources.map(r => r.id===id ? {...r,[key]:val} : r));
  const removeResource = (id) => set('resources', form.resources.filter(r=>r.id!==id));

  const handleSave = () => {
    const weekday = form.date ? new Date(form.date+'T00:00:00').toLocaleDateString(undefined,{weekday:'long'}) : '';
    onSave({
      id: form.id, week: form.date ? form.week : (form.week===''? null : Number(form.week)),
      date: form.date || null, weekday: form.date ? weekday : null, start: form.start || null, end: form.end || null,
      name: form.name, pillar: form.pillar, mode: form.mode,
      facilitators: form.facilitatorsText.split(',').map(x=>x.trim()).filter(Boolean),
      resources: form.resources.filter(r=>r.url.trim()),
      calendared: !!form.date && !!form.start && !!form.end,
    });
  };

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(27,39,51,0.4)', display:'flex', justifyContent:'flex-end', zIndex:100}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:400, maxWidth:'92vw', background:'#fff', height:'100%', overflowY:'auto', padding:22, boxShadow:'-8px 0 24px rgba(0,0,0,.12)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
          <div style={{fontWeight:700, fontSize:15}}>{session.id ? 'Edit session' : 'New session'}</div>
          <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', color:'#8A96A3'}}><X size={18}/></button>
        </div>
        <Field label="Session name"><input style={inputStyle} value={form.name} onChange={e=>set('name', e.target.value)} placeholder="e.g. Backward Planning Workshop" /></Field>
        <div style={{display:'flex', gap:10}}>
          <Field label="Date" style={{flex:1}}><input type="date" style={inputStyle} value={form.date||''} onChange={e=>set('date', e.target.value)} /></Field>
          <Field label="Week" style={{width:110}}><select style={inputStyle} value={form.week??''} onChange={e=>set('week', e.target.value)}><option value="">—</option>{WEEKS.map(w => <option key={w} value={w}>Week {String(w).padStart(2,'0')}</option>)}</select></Field>
        </div>
        <div style={{display:'flex', gap:10}}>
          <Field label="Start time" style={{flex:1}}><input type="time" style={inputStyle} value={form.start||''} onChange={e=>set('start', e.target.value)} /></Field>
          <Field label="End time" style={{flex:1}}><input type="time" style={inputStyle} value={form.end||''} onChange={e=>set('end', e.target.value)} /></Field>
        </div>
        <Field label="Pillar"><select style={inputStyle} value={form.pillar} onChange={e=>set('pillar', e.target.value)}>{PILLARS.map(p => <option key={p} value={p}>{p}</option>)}</select></Field>
        <Field label="Work mode (for time tracking)"><select style={inputStyle} value={form.mode} onChange={e=>set('mode', e.target.value)}>{MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
        <Field label="Facilitators (comma-separated, supports multiple)"><input style={inputStyle} value={form.facilitatorsText} onChange={e=>set('facilitatorsText', e.target.value)} placeholder="e.g. Nusrat, Kabir" /></Field>
        <Field label="Resources">
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {form.resources.map(r => (
              <div key={r.id} style={{display:'flex', gap:6, alignItems:'center'}}>
                <select style={{...inputStyle, width:120, flexShrink:0}} value={r.label} onChange={e=>updateResource(r.id,'label',e.target.value)}>{RESOURCE_KINDS.map(k => <option key={k} value={k}>{k}</option>)}</select>
                <input style={inputStyle} placeholder="https://…" value={r.url} onChange={e=>updateResource(r.id,'url',e.target.value)} />
                <button onClick={()=>removeResource(r.id)} style={{background:'none', border:'none', color:'#B84C4C', cursor:'pointer', flexShrink:0}}><X size={15}/></button>
              </div>
            ))}
          </div>
          <button onClick={addResource} style={{...btnGhost, marginTop:8, padding:'6px 4px'}}><Plus size={13}/> Add resource link</button>
        </Field>
        <div style={{display:'flex', gap:8, marginTop:20}}>
          <button onClick={handleSave} style={{...btnPrimary, flex:1, justifyContent:'center', padding:'10px'}}>Save session</button>
          {onDelete && <button onClick={()=>{ if(window.confirm('Delete this session?')) onDelete(session.id); }} style={{...btnSecondary, color:'#B84C4C', borderColor:'#E3B8B8'}}>Delete</button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, style }){
  return (<div style={{marginBottom:14, ...style}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>{label}</div>{children}</div>);
}
const inputStyle = {width:'100%', padding:'8px 10px', borderRadius:6, border:'1px solid #C9CDD2', fontSize:13, fontFamily:FONT, boxSizing:'border-box'};
