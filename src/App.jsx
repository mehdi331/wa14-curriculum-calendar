import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, X, Download, Upload, ArrowCounterClockwise as RotateCcw, Users, Clock, Calendar as CalendarIcon, Table as TableIcon, ChartBar as BarChart3, Link as LinkIcon, SignOut as LogOut, UserPlus, Trash as Trash2, ShieldCheck, ChatCircle as MessageSquare, PaperPlaneTilt as Send, DoorOpen, ClipboardText } from '@phosphor-icons/react';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, GoogleAuthProvider } from 'firebase/auth';
import * as XLSX from 'xlsx';
import { auth as firebaseAuth } from './firebaseConfig';
import { storage, ASSESSMENT_KEYS, parseStoredArray } from './storage';

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
const DEFAULT_PILLARS = Object.keys(PILLAR_COLOR).map((name, index) => ({id:'pillar'+index, name, color:PILLAR_COLOR[name]}));
const MODES = ['Sync','Async','Coaching','Workshop'];
const MODE_COLOR = { Sync:'#1F6F78', Async:'#B8863B', Coaching:'#6B5CA5', Workshop:'#A64D4D' };
const RESOURCE_KINDS = ['Session plan','Slides','Async work','Exit ticket','Old folder','Other'];
const ASSESSMENT_TYPES = ['single','multiple','check','paragraph','mcq_grid','checkbox_grid'];
const WEEKS = [0,1,2,3,4,5,6];
const GRID_START = 0;      // 00:00 — full-day grid
const GRID_END = 24*60;    // 24:00 (end-of-day boundary)
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
const STAFF_ROLES = [
  { id:'academy_lead',            label:'Academy Lead' },
  { id:'afa_lead',                label:'Academy Fellow Advisor Lead' },
  { id:'curriculum_specialist',  label:'Curriculum Specialist' },
  { id:'afa',                     label:'Academy Fellow Advisor (AFA)' },
  { id:'placement_ops',          label:'School Placement and Operations' },
];
const ROLE_LABEL = {
  superadmin:'Superadmin',
  planner:'Planning team (legacy)',
  resource_planner:'Resources only',
  staff:'Staff',
  fellow:'Fellow',
  academy_lead:'Academy Lead',
  afa_lead:'Academy Fellow Advisor Lead',
  curriculum_specialist:'Curriculum Specialist',
  afa:'AFA',
  placement_ops:'School Placement & Ops',
};

const DEFAULT_ACCOUNTS = [
  {email:'mehdi@teachforbangladesh.org',    name:'Mehdi Morshed Chowdhury', role:'academy_lead'},
  {email:'asifur@teachforbangladesh.org',    name:'Md Asifur Rahman',             role:'afa_lead'},
  {email:'hasibur@teachforbangladesh.org',    name:'Hasibur Rahman Sohan',        role:'curriculum_specialist'}
];

// Access level for each WA Staff member: what they can manage.
const STAFF_ACCESS = [
  { id:'full',                   label:'Full control' },
  { id:'resources_assessments', label:'Resources + assessments' },
  { id:'resources',             label:'Resources only' },
];
const DEFAULT_ACCESS = 'resources';

// Staff roles that act as traditional managers/full admins of the calendar.
const STAFF_ADMIN_ROLES = ['academy_lead','afa_lead','curriculum_specialist','placement_ops','resource_planner'];
const AFA_ROLES = ['afa','afa_lead'];

function toMin(t){ if(!t) return null; const [h,m]=t.split(':').map(Number); return h*60+m; }
// Format a Date object to YYYY-MM-DD in local time (avoids UTC shift from toISOString)
function toIsoDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}
// Week index for a date, derived from the academy start date (Sunday-anchored).
// Week 00 is the full week (Sunday-Saturday) before the start date's week.
// Week 01 is the start date's week, etc.
function weekForDate(date, startDate){
  if (!startDate) return null;
  const s = new Date(startDate+'T00:00:00'); s.setDate(s.getDate() - s.getDay() - 7); // Go to Sunday of the week BEFORE
  const d = new Date(date+'T00:00:00');
  const diff = Math.floor((d - s) / (24*60*60*1000));
  return Math.floor(diff / 7);
}
// A session whose end <= start flows past midnight into the next day (e.g. 23:00 → 01:00)
function wrapsMidnight(s){ const a=toMin(s.start), b=toMin(s.end); return a!=null && b!=null && b<=a; }
function durationMin(s){ const a=toMin(s.start), b=toMin(s.end); if(a==null||b==null) return 0; let d=b-a; if(d<=0) d+=24*60; return d; }
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

function normalizeImageUrl(value){
  const raw = (value || '').trim();
  if (!raw) return '';
  const fileMatch = raw.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  const queryMatch = raw.match(/[?&]id=([^&]+)/i);
  const id = fileMatch?.[1] || queryMatch?.[1];
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : raw;
}

function normalizeFellow(fellow){
  return {
    ...fellow,
    track: (fellow.track || fellow.level || '').toLowerCase(),
    grade: fellow.grade || '',
    placementCity: fellow.placementCity || fellow.city || '',
    roomIds: Array.isArray(fellow.roomIds) ? fellow.roomIds : [],
  };
}

function normalizeQuestion(question, assessmentId){
  const options = (Array.isArray(question.options) ? question.options : []).map((option, index) => typeof option === 'string' ? {id:`option-${question.id || newId()}-${index}`, text:option} : {id:option.id || `option-${question.id || newId()}-${index}`, text:option.text || ''});
  const legacyCorrect = Array.isArray(question.correct) ? question.correct : [];
  return {
    ...question,
    id: question.id || `question-${assessmentId}-${newId()}`,
    assessmentId,
    options,
    gridRows: Array.isArray(question.gridRows) ? question.gridRows : [],
    gridCols: Array.isArray(question.gridCols) ? question.gridCols : [],
    correct: legacyCorrect.map(answer => options.find(option => option.id===answer || option.text===answer)?.id || answer).filter(Boolean),
    imageUrl: normalizeImageUrl(question.imageUrl),
    rubric: question.rubric || '',
    expectedConcepts: Array.isArray(question.expectedConcepts) ? question.expectedConcepts : [],
    gradingMode: question.gradingMode || (question.type==='paragraph' ? 'manual_review' : 'automatic'),
    points: Number(question.points) || 1,
  };
}

function normalizeAssessment(assessment, legacyQuestions){
  const localQuestions = Array.isArray(assessment.questions) ? assessment.questions :
    (assessment.questionIds || []).map(id => legacyQuestions.find(question => String(question.id)===String(id))).filter(Boolean);
  const questions = [];
  const seen = new Set();
  localQuestions.forEach(question => {
    const normalized = normalizeQuestion(question, assessment.id);
    if (!seen.has(String(normalized.id))) { seen.add(String(normalized.id)); questions.push(normalized); }
  });
  return {
    ...assessment,
    questions,
    questionIds: questions.map(question=>question.id),
    assignmentGroups: (assessment.assignmentGroups || []).map(group => ({
      ...group,
      track: (group.track || '').toLowerCase(),
      roomIds: Array.isArray(group.roomIds) ? group.roomIds : [],
      afaGroup: group.afaGroup || '',
      placementCity: group.placementCity || '',
      fellowIds: Array.isArray(group.fellowIds) ? group.fellowIds : [],
      questionIds: Array.isArray(group.questionIds) ? group.questionIds : [],
    })),
  };
}

// Facilitator record: { id, staffName, roomId } (+ optional legacy `group`)
function facilitatorLabel(f, rooms, staff){
  if (typeof f === 'string') return f;
  if (!f) return '';
  const room = f.roomId ? (rooms||[]).find(x=>''+x.id===String(f.roomId)) : null;
  const roomName = room ? room.name : '';
  const parts = [ (f.staffName||f.name||'').trim(), roomName ].filter(Boolean);
  if (parts.length) return parts.join(' · ');
  if (f.kind === 'room') return roomName || (f.roomId||'');   // legacy shape
  return f.group || f.afaGroup || '';                          // legacy shape
}
function fmtFacilitators(facs, rooms, staff){
  return (facs||[]).map(f=>facilitatorLabel(f, rooms, staff)).filter(Boolean).join(', ');
}
function fellowMatchesGroup(fellow, group){
  const track = (fellow.track || '').toLowerCase();
  const groupTrack = (group.track || '').toLowerCase();
  return (!groupTrack || groupTrack==='all' || track===groupTrack) &&
    (!group.afaGroup || fellow.afaGroup===group.afaGroup) &&
    (!group.placementCity || fellow.placementCity===group.placementCity) &&
    (!(group.roomIds||[]).length || (group.roomIds||[]).some(id=>(fellow.roomIds||[]).includes(id)));
}

function resolveAssignmentGroup(group, roster){
  return roster.filter(fellow=>fellowMatchesGroup(fellow, group)).map(fellow=>fellow.id);
}

function effectiveQuestions(assessment, fellowId, roster){
  const groups = assessment.assignmentGroups || [];
  const assigned = groups.filter(group => (group.fellowIds||[]).includes(fellowId));
  const targeted = new Set(assigned.flatMap(group=>group.questionIds||[]));
  return (assessment.questions || []).filter(question => !question.targetGroupIds?.length || assigned.some(group=>question.targetGroupIds.includes(group.id)) || targeted.has(question.id));
}

const FONT = "-apple-system, 'Inter', 'Segoe UI', sans-serif";

export default function App(){
  const [auth, setAuth] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const localUser = getLocalTestUser();
      if (localUser) {
        setAuth(localUser);
        setAuthLoaded(true);
        return;
      }
    }
    return onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setAuth(null);
        setAuthLoaded(true);
        return;
      }
      if (!user.email?.toLowerCase().endsWith('@teachforbangladesh.org')) {
        await signOut(firebaseAuth);
        setAuthError('Use your Teach For Bangladesh Google account to continue.');
        setAuthLoaded(true);
        return;
      }
      const resolved = await resolveRole(user);
      if (resolved.ok) {
        setAuth(resolved);
        setAuthError('');
      } else {
        await signOut(firebaseAuth);
        setAuthError(resolved.error);
      }
      setAuthLoaded(true);
    });
  }, []);

  const handleLogin = async () => {
    if (authBusy) return;
    setAuthError('');
    setAuthBusy(true);
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
    } catch (error) {
      setAuthError(authErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };
  const handleRedirectLogin = async () => {
    setAuthError('');
    setAuthBusy(true);
    try {
      await signInWithRedirect(firebaseAuth, new GoogleAuthProvider());
    } catch (error) {
      setAuthBusy(false);
      setAuthError(authErrorMessage(error));
    }
  };
  const handleLogout = () => signOut(firebaseAuth);
  const handleLocalLogin = role => {
    if (!import.meta.env.DEV) return;
    const localUser = role === 'superadmin' ? {
      email:'local-superuser@localhost', name:'Local Superuser', role:'superadmin', uid:'local-superuser', localTest:true
    } : {
      email:'demo.fellow1@teachforbangladesh.org', name:'DEMO Fellow 01', role:'fellow', fellowId:'demo-fellow-1', afaGroup:'DEMO AFA 1', uid:'local-fellow', localTest:true
    };
    localStorage.setItem('wa14-local-test-auth', JSON.stringify(localUser));
    setAuth(localUser);
  };
  const handleLogoutAll = () => {
    if (import.meta.env.DEV) {
      localStorage.removeItem('wa14-local-test-auth');
      setAuth(null);
    }
    return handleLogout();
  };

  if (!authLoaded) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'400px',color:'#8A96A3',fontFamily:FONT}}>Loading…</div>;
  if (!auth) return <LoginGate onLogin={handleLogin} onLocalLogin={handleLocalLogin} onRedirectLogin={handleRedirectLogin} error={authError} busy={authBusy} />;
  return <MainApp auth={auth} onLogout={handleLogoutAll} />;
}

function getLocalTestUser(){
  try {
    const raw = localStorage.getItem('wa14-local-test-auth');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function authErrorMessage(error){
  const messages = {
    'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Use the redirect option below or allow popups for this site.',
    'auth/unauthorized-domain': 'This site is not authorized in Firebase. Add its domain under Authentication settings.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled for this Firebase project.',
    'auth/network-request-failed': 'The sign-in request could not reach Google. Check your network, VPN, or browser connection.',
    'auth/cancelled-popup-request': 'Another Google sign-in window is already open. Close it and try again.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed before sign-in finished.',
  };
  return messages[error?.code] || 'Google sign-in could not be completed. Check your browser settings and try again.';
}

async function resolveRole(user){
  const em = (user.email||'').trim().toLowerCase();
  let accounts = [];
  try {
    const res = await storage.get('wa14-accounts');
    accounts = res && res.value ? JSON.parse(res.value) : [];
  } catch (e) { return { ok:false, error:'Could not verify right now — please try again.' }; }

  if (em === SUPERADMIN_EMAIL) return { ok:true, email:em, role:'superadmin', access:'full', name:user.displayName || 'Superadmin', uid:user.uid };

  if (STAFF_EMAIL_RE.test(em)) {
    const match = accounts.find(a => a.email.toLowerCase()===em);
    const role = match?.role || 'staff';
    const access = match?.access || (STAFF_ADMIN_ROLES.includes(role) || role==='planner' ? 'full' : DEFAULT_ACCESS);
    return { ok:true, email:em, role, access, name:match?.name || user.displayName || em.split('@')[0], uid:user.uid };
  }

  if (FELLOW_EMAIL_RE.test(em)) {
    try {
      const res = await storage.get('wa14-roster');
      const roster = res && res.value ? JSON.parse(res.value) : [];
      const match = roster.find(r => r.email.toLowerCase()===em);
      if (match) {
        return { ok:true, email:em, role:'fellow', name:match.name, fellowId:match.id, afaGroup:match.afaGroup || '', uid:user.uid };
      }
    } catch (e) { return { ok:false, error:'Could not verify right now — please try again.' }; }
    return { ok:false, error:"This email isn't on the approved Fellow list yet. Ask a planner to add it." };
  }

  return { ok:false, error:'Enter a valid @teachforbangladesh.org email — staff use name@teachforbangladesh.org, Fellows use firstname.lastname@teachforbangladesh.org.' };
}

function LoginGate({ onLogin, onLocalLogin, onRedirectLogin, error, busy }){
  return (
    <div className="wa14-app" style={{fontFamily:FONT, minHeight:'480px', display:'flex', alignItems:'center', justifyContent:'center', background:'#EFF3F4'}}>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:10, padding:32, width:340, maxWidth:'88vw'}}>
        <div style={{fontWeight:800, fontSize:20, marginBottom:2}}>Training and Design</div>
        <div style={{fontSize:12, color:'#8A96A3', marginBottom:4}}>Teach For Bangladesh</div>
        <div style={{fontSize:12.5, color:'#8A96A3', marginBottom:20}}>Sign in with your Teach For Bangladesh Google account.</div>
        {error && <div style={{color:'#B84C4C', fontSize:12, marginBottom:10, lineHeight:1.4}}>{error}</div>}
        <button type="button" onClick={onLogin} disabled={busy} className={btnPrimary+' w-full justify-center py-2.5 mt-1.5'} style={{opacity:busy?0.65:1}}>{busy ? 'Opening Google…' : 'Continue with Google'}</button>
        {error && <button type="button" onClick={onRedirectLogin} disabled={busy} className={btnGhost+' w-full justify-center mt-2'}>Use redirect sign-in</button>}
        {import.meta.env.DEV && <div style={{marginTop:22,paddingTop:16,borderTop:'1px solid #EEF0F2'}}><div style={{fontSize:11.5,color:'#8A96A3',marginBottom:8}}>Local testing only. These buttons are disabled in production.</div><div style={{display:'flex',gap:8}}><button type="button" onClick={()=>onLocalLogin('superadmin')} className={btnSecondary+' flex-1 justify-center'}>Test superuser</button><button type="button" onClick={()=>onLocalLogin('fellow')} className={btnSecondary+' flex-1 justify-center'}>Test Fellow</button></div></div>}
      </div>
    </div>
  );
}

function MainApp({ auth, onLogout }){
  const isSuperadmin = auth.role === 'superadmin';
  const access = auth.access || (isSuperadmin ? 'full' : (STAFF_ADMIN_ROLES.includes(auth.role) || auth.role==='planner' ? 'full' : DEFAULT_ACCESS));
  const isFullControl = access==='full';
  const isAssessmentsEditor = access==='full' || access==='resources_assessments';
  const isAdmin = isFullControl || access==='resources' || isAssessmentsEditor;
  const isFullAdmin = isSuperadmin || isFullControl;
  const isViewer = !isAdmin; // read-only staff/fellow
  const canEditAssessments = isAssessmentsEditor;

  const [sessions, setSessions] = useState(null);
  const [roster, setRoster] = useState(null);       // fellows
  const [planners, setPlanners] = useState(null);
  const [rooms, setRooms] = useState(null);
  const [pillars, setPillars] = useState(null);
  const [requests, setRequests] = useState(null);
  const [academySettings, setAcademySettings] = useState(null);
  const [assessments, setAssessments] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState(null);
  const [assessmentAttempts, setAssessmentAttempts] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('calendar');
  const [activeWeek, setActiveWeek] = useState(0);
  const [hiddenDays, setHiddenDays] = useState({});
  const [editing, setEditing] = useState(null);
  const [placement, setPlacement] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [weekFilter, setWeekFilter] = useState('all');
  const [pillarFilter, setPillarFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [sessionSearch, setSessionSearch] = useState('');
  const [toast, setToast] = useState('');
  const saveTimer = useRef(null);
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;
  const rosterSaveTimer = useRef(null);
  const plannerSaveTimer = useRef(null);
  const roomSaveTimer = useRef(null);
  const pillarSaveTimer = useRef(null);
  const requestSaveTimer = useRef(null);
  const settingsSaveTimer = useRef(null);
  const assessmentsSaveTimer = useRef(null);
  const questionsSaveTimer = useRef(null);
  const attemptsSaveTimer = useRef(null);
  const attendanceSaveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try { const r = await storage.get('wa14-sessions'); setSessions(r && r.value ? JSON.parse(r.value) : SEED); }
      catch (e) { setSessions(SEED); }
      let loadedQuestions = [];
      try {
        const r = await storage.get('wa14-roster'); const fellows = r && r.value ? JSON.parse(r.value) : [];
        setRoster(fellows.map(({ pin, ...fellow }) => normalizeFellow(fellow)));
      }
      catch (e) { setRoster([]); }
      try {
        const r = await storage.get('wa14-planners');
        if (r && r.value) {
          setPlanners(JSON.parse(r.value).map(({ pin, ...planner }) => planner));
        }
        else {
          const a = await storage.get('wa14-accounts');
          const accounts = a && a.value ? JSON.parse(a.value) : DEFAULT_ACCOUNTS;
          setPlanners(accounts.filter(x=>x.role==='planner' || x.role==='resource_planner').map((x,i)=>({...x,id:x.id||'p'+i})));
        }
      }
      catch (e) { setPlanners([]); }
      try { const r = await storage.get('wa14-requests'); setRequests(r && r.value ? JSON.parse(r.value) : []); }
      catch (e) { setRequests([]); }
      try { const r = await storage.get('wa14-rooms'); setRooms(r && r.value ? JSON.parse(r.value) : []); }
      catch (e) { setRooms([]); }
      try { const r = await storage.get('wa14-pillars'); setPillars(r && r.value ? JSON.parse(r.value) : DEFAULT_PILLARS); }
      catch (e) { setPillars(DEFAULT_PILLARS); }
      try { const r = await storage.get('wa14-settings'); const settings = r && r.value ? JSON.parse(r.value) : {}; setAcademySettings({...settings, fellowWeeks:Array.isArray(settings.fellowWeeks) ? settings.fellowWeeks : WEEKS}); }
      catch (e) { setAcademySettings({fellowWeeks:WEEKS}); }
      try { loadedQuestions = parseStoredArray(await storage.get(ASSESSMENT_KEYS.questions)); setAssessmentQuestions(loadedQuestions); }
      catch (e) { setAssessmentQuestions([]); }
      try { setAssessments(parseStoredArray(await storage.get(ASSESSMENT_KEYS.assessments)).map(assessment=>normalizeAssessment(assessment, loadedQuestions))); }
      catch (e) { setAssessments([]); }
      try { setAssessmentAttempts(parseStoredArray(await storage.get(ASSESSMENT_KEYS.attempts))); }
      catch (e) { setAssessmentAttempts([]); }
      try { setAttendance(parseStoredArray(await storage.get(ASSESSMENT_KEYS.attendance))); }
      catch (e) { setAttendance([]); }
      setLoaded(true);
    })();
  }, []);

  const debouncedPersist = (setter, timerRef, key, onError) => (next) => {
    setter(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try { await storage.set(key, JSON.stringify(next)); }
      catch (e) { console.error('save failed', key, e); if (onError) onError(e); }
    }, 250);
  };
  const persist = debouncedPersist(setSessions, saveTimer, 'wa14-sessions');
  const persistRoster = debouncedPersist(setRoster, rosterSaveTimer, 'wa14-roster');
  const persistPlanners = debouncedPersist(setPlanners, plannerSaveTimer, 'wa14-planners');
  const persistRequests = debouncedPersist(setRequests, requestSaveTimer, 'wa14-requests');
  const persistRooms = debouncedPersist(setRooms, roomSaveTimer, 'wa14-rooms');
  const persistPillars = debouncedPersist(setPillars, pillarSaveTimer, 'wa14-pillars');
  const persistSettings = debouncedPersist(setAcademySettings, settingsSaveTimer, 'wa14-settings');
  const persistAssessments = debouncedPersist(setAssessments, assessmentsSaveTimer, ASSESSMENT_KEYS.assessments);
  const persistAssessmentQuestions = debouncedPersist(setAssessmentQuestions, questionsSaveTimer, ASSESSMENT_KEYS.questions);
  const persistAssessmentAttempts = debouncedPersist(setAssessmentAttempts, attemptsSaveTimer, ASSESSMENT_KEYS.attempts, err => { if (err) showToast('Save failed: '+(err.code || err.message)+' — check that you are signed in with a Teach For Bangladesh account.'); });
  const persistAttendance = debouncedPersist(setAttendance, attendanceSaveTimer, ASSESSMENT_KEYS.attendance);
  const persistRoomsAndRoster = nextRooms => {
    persistRooms(nextRooms);
    if (roster) persistRoster(roster.map(fellow=>({...fellow,roomIds:nextRooms.filter(room=>(room.fellowIds||[]).includes(fellow.id)).map(room=>room.id)})));
  };

  const addAccount = async (person, role) => {
    try {
      const res = await storage.get('wa14-accounts');
      const accounts = res && res.value ? JSON.parse(res.value) : DEFAULT_ACCOUNTS;
      const next = accounts.filter(a=>a.email.toLowerCase()!==person.email.toLowerCase());
      next.push({email:person.email, name:person.name, role, access:person.access || (STAFF_ADMIN_ROLES.includes(role) || role==='planner' ? 'full' : DEFAULT_ACCESS)});
      await storage.set('wa14-accounts', JSON.stringify(next));
    } catch (e) { console.error('account save failed', e); }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''), 2200); };

  const importExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (!rows.length) { showToast('No data found in file'); return; }

        // Helper to find a value from row by possible keys (case-insensitive, trimmed)
        const findValue = (row, possibleKeys) => {
          // First try exact match
          for (const key of possibleKeys) {
            if (row[key] !== undefined && row[key] !== '') return String(row[key]).trim();
          }
          // Then try case-insensitive match with trimmed keys
          const rowKeys = Object.keys(row);
          for (const key of possibleKeys) {
            const match = rowKeys.find(k => k.trim().toLowerCase() === key.toLowerCase());
            if (match && row[match] !== undefined && row[match] !== '') return String(row[match]).trim();
          }
          return '';
        };

        const startDate = academySettings?.startDate;
        const newSessions = [];
        const skippedRows = [];

        rows.forEach((row, idx) => {
          const date = findValue(row, ['Date', 'date', 'DATE', 'Session Date', 'session date', 'Day', 'day']);
          const start = findValue(row, ['Start', 'start', 'START', 'Start Time', 'start time', 'Time Start', 'Begin', 'begin']);
          const end = findValue(row, ['End', 'end', 'END', 'End Time', 'end time', 'Time End', 'Finish', 'finish']);
          const name = findValue(row, ['Session Name', 'name', 'NAME', 'Session', 'session', 'SESSION', 'Session Title', 'session title', 'Title', 'title', 'Activity', 'activity']);

          if (!date || !name) {
            skippedRows.push({ row: idx + 1, reason: !date ? 'missing date' : 'missing name', data: JSON.stringify(row).substring(0, 100) });
            return;
          }

          // Parse date - handle various formats
          let dateObj;
          if (date.includes('-')) {
            // ISO format: YYYY-MM-DD
            dateObj = new Date(date + 'T00:00:00');
          } else if (date.includes('/')) {
            // Format: MM/DD/YYYY or DD/MM/YYYY
            const parts = date.split('/');
            if (parts[0].length === 4) {
              // YYYY/MM/DD
              dateObj = new Date(date.replace(/\//g, '-') + 'T00:00:00');
            } else {
              // Assume MM/DD/YYYY
              dateObj = new Date(parts[2], parseInt(parts[0]) - 1, parts[1]);
            }
          } else {
            // Try parsing as-is
            dateObj = new Date(date);
          }

          if (isNaN(dateObj.getTime())) {
            skippedRows.push({ row: idx + 1, reason: 'invalid date: ' + date });
            return;
          }

          // Format date as YYYY-MM-DD
          const isoDate = dateObj.getFullYear() + '-' +
            String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
            String(dateObj.getDate()).padStart(2, '0');

          const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'long' });
          const week = startDate ? weekForDate(isoDate, startDate) : parseInt(findValue(row, ['Week', 'week', 'WEEK'])) || 0;

          newSessions.push({
            id: 'imp-' + Date.now() + '-' + idx,
            week: week,
            date: isoDate,
            weekday,
            start,
            end,
            name,
            pillar: findValue(row, ['Pillar', 'pillar', 'PILLAR', 'Category', 'category', 'Type', 'type']) || PILLARS[0],
            mode: findValue(row, ['Mode', 'mode', 'MODE', 'Format', 'format']) || 'Sync',
            facilitators: findValue(row, ['Facilitators', 'facilitators', 'FACILITATORS', 'Facilitator', 'facilitator', 'Presenter', 'presenter', 'Lead', 'lead']).split(',').map(s => s.trim()).filter(Boolean),
            rooms: [],
            resources: [],
            outcomes: findValue(row, ['Outcomes', 'outcomes', 'OUTCOMES', 'Outcome', 'outcome', 'Objectives', 'objectives', 'Objective', 'objective']).split('|').map(s => s.trim()).filter(Boolean),
            notes: findValue(row, ['Notes', 'notes', 'NOTES', 'Note', 'note', 'Description', 'description']),
            fellowNotes: findValue(row, ['Fellow Notes', 'fellow notes', 'Fellow Note', 'fellow note']),
            afaGroup: findValue(row, ['AFA Group', 'afa group', 'AFA', 'afa', 'Group', 'group']),
            calendared: true,
          });
        });

        if (skippedRows.length > 0) {
          console.log('Import skipped rows:', skippedRows);
        }

        if (!newSessions.length) {
          const skipInfo = skippedRows.slice(0, 3).map(s => `Row ${s.row}: ${s.reason}`).join('; ');
          showToast('No valid sessions. ' + (skipInfo ? 'Issues: ' + skipInfo : 'Check column names'));
          return;
        }

        const next = [...sessions, ...newSessions];
        persist(next);
        showToast('Imported ' + newSessions.length + ' session' + (newSessions.length === 1 ? '' : 's') + (skippedRows.length ? ' (' + skippedRows.length + ' skipped)' : ''));
      } catch (err) {
        console.error('Import failed', err);
        showToast('Import failed: ' + err.message);
      }
    };
    input.click();
  };


  const saveSession = (s) => {
    const current = sessionsRef.current;
    const next = current.find(x=>x.id===s.id) ? current.map(x => x.id===s.id ? s : x) : [...current, s];
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
      'Duration (min)': (s.start && s.end) ? durationMin(s) : '',
      'Session Name': s.name, Pillar: s.pillar, Mode: s.mode,
      Facilitators: fmtFacilitators(s.facilitators, rooms),
      Resources: (s.resources||[]).map(r=>r.label+': '+r.url).join(' | '),
      Outcomes: (s.outcomes||[]).join(' | '),
      Calendared: s.calendared ? 'Yes' : 'No',
    }));
    rows.sort((a,b) => (a.Date||'zzzz').localeCompare(b.Date||'zzzz') || (a.Start||'').localeCompare(b.Start||''));
    const wb = XLSX.utils.book_new();
    const append = (name, data) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), name);
    append('Calendar', rows);
    append('Sessions', rows);
    append('Time Summary', sessions.map(session=>({Week:session.week,Mode:session.mode,Session:session.name,DurationMinutes:session.start&&session.end?durationMin(session):''})));
    append('Fellows', roster.map(fellow=>({Name:fellow.name,Email:fellow.email,Track:fellow.track,Grade:fellow.grade,PlacementCity:fellow.placementCity,AFAGroup:fellow.afaGroup,RoomIds:(fellow.roomIds||[]).join(', ')})));
    append('Assessments', assessments.map(assessment=>({Title:assessment.title,SessionId:assessment.sessionId,Status:assessment.status,Questions:(assessment.questions||[]).length,Fellows:(assessment.assignmentGroups||[]).flatMap(group=>group.fellowIds||[]).length})));
    append('Questions', assessments.flatMap(assessment=>(assessment.questions||[]).map(question=>({Assessment:assessment.title,Question:question.text,Type:question.type,ImageUrl:question.imageUrl||'',Options:(question.options||[]).map(option=>typeof option==='string'?option:option.text).join(' | '),Correct:(question.correct||[]).join(' | '),Rubric:question.rubric||'',ExpectedConcepts:(question.expectedConcepts||[]).join(' | '),Points:question.points}))));
    append('Attempts', assessmentAttempts.map(attempt=>({AssessmentId:attempt.assessmentId,FellowId:attempt.fellowId,Status:attempt.status,StartedAt:attempt.startedAt,SubmittedAt:attempt.submittedAt||'',Answers:JSON.stringify(attempt.answers||{}),Reviews:JSON.stringify(attempt.reviews||{})})));
    append('Paragraph reviews', assessmentAttempts.flatMap(attempt=>Object.entries(attempt.reviews||{}).map(([questionId,review])=>({AssessmentId:attempt.assessmentId,FellowId:attempt.fellowId,QuestionId:questionId,Status:review.status||'',Score:review.score??'',Feedback:review.feedback||'',Reviewer:review.reviewer||'',ReviewedAt:review.reviewedAt||'',AISuggestedScore:review.aiSuggestion?.suggestedScore??'',AIConfidence:review.aiSuggestion?.confidence??'',AIFeedback:review.aiSuggestion?.feedback||''}))));
    append('Attendance', attendance.map(entry=>({SessionId:entry.sessionId,FellowId:entry.fellowId,Status:entry.status,RecordedAt:entry.recordedAt})));
    append('Analytics', sessions.map(session=>({Session:session.name,OnTime:attendance.filter(entry=>entry.sessionId===session.id&&entry.status==='on_time').length,Late:attendance.filter(entry=>entry.sessionId===session.id&&entry.status==='late').length})));
    XLSX.writeFile(wb, 'WA14_Training_Design_Export.xlsx');
    showToast('Exported to Excel');
  };

  const requestUpdate = (req) => {
    const entry = { id:'req'+Date.now(), ...req, createdAt:new Date().toISOString(), resolved:false };
    persistRequests([...(requests||[]), entry]);
    showToast('Request sent to the planning team');
  };
  const resolveRequest = (id, resolved) => persistRequests(requests.map(r => r.id===id ? {...r, resolved} : r));
  const deleteRequest = (id) => persistRequests(requests.filter(r=>r.id!==id));
  const seedDemo = () => {
    if (!window.confirm('Create demo Fellows, sessions, questions, and assessments?')) return;
    const demoFellows = Array.from({length:10},(_,index)=>({id:`demo-fellow-${index+1}`,name:`DEMO Fellow ${String(index+1).padStart(2,'0')}`,email:`demo.fellow${index+1}@teachforbangladesh.org`,afaGroup:`DEMO AFA ${index%3+1}`,track:index%2?'secondary':'primary',placementCity:['Dhaka','Chattogram','Rajshahi'][index%3]}));
    const demoSessions = Array.from({length:5},(_,index)=>({id:90000+index,week:index%3,date:`2026-11-${String(1+index).padStart(2,'0')}`,weekday:'Sunday',start:'10:00',end:'11:00',name:`DEMO Session ${index+1}`,pillar:'Academic Content',mode:'Workshop',facilitators:['Demo Facilitator'],resources:[],outcomes:['Demo outcome'],notes:'',fellowNotes:'',afaGroup:`DEMO AFA ${index%3+1}`,attendanceCode:`DEMO${index+1}`,calendared:true}));
    const demoQuestions = Array.from({length:5},(_,index)=>({id:`demo-question-${index+1}`,type:'single',text:`DEMO Question ${index+1}`,options:['Option A','Option B','Option C'],gridRows:['Row 1'],gridCols:['Column 1'],correct:['Option A'],points:1,timeLimit:0,imageUrl:''}));
    const demoAssessments = demoSessions.map((session,index)=>({id:`demo-assessment-${index+1}`,sessionId:session.id,title:`DEMO Assessment ${index+1}`,description:'Demo assessment',status:'published',startsAt:'2026-10-01T00:00',endsAt:'2026-12-31T23:59',durationMinutes:20,questionIds:demoQuestions.map(question=>question.id),assignmentGroups:[{id:`demo-group-${index+1}`,track:index%2?'secondary':'primary',fellowIds:demoFellows.filter(fellow=>fellow.track===(index%2?'secondary':'primary')).map(fellow=>fellow.id),questionIds:demoQuestions.map(question=>question.id)}],demo:true}));
    demoQuestions.push({id:'demo-paragraph-question',type:'paragraph',text:'DEMO reflection: Describe one teaching practice you will apply and why.',options:[],correct:[],points:3,timeLimit:0,imageUrl:'',rubric:'Name a specific teaching practice and explain why it supports learning.',expectedConcepts:['specific practice','reasoning']});
    demoAssessments.forEach(assessment=>{
      assessment.startsAt='2026-01-01T00:00';
      assessment.endsAt='2026-12-31T23:59';
      assessment.questions=demoQuestions.map(question=>normalizeQuestion(question,assessment.id));
      assessment.questionIds=assessment.questions.map(question=>question.id);
      assessment.assignmentGroups.forEach(group=>{group.questionIds=assessment.questionIds;});
    });
    persistRoster([...roster.filter(fellow=>!fellow.id?.toString().startsWith('demo-')), ...demoFellows]);
    persist([...sessions.filter(session=>!session.name?.startsWith('DEMO ')), ...demoSessions]);
    persistAssessmentQuestions([...assessmentQuestions.filter(question=>!question.id?.toString().startsWith('demo-')), ...demoQuestions]);
    persistAssessments([...assessments.filter(assessment=>!assessment.id?.toString().startsWith('demo-')), ...demoAssessments]);
    showToast('Demo data created');
  };
  const deleteDemo = () => {
    if (!window.confirm('Delete all DEMO records?')) return;
    persistRoster(roster.filter(fellow=>!fellow.id?.toString().startsWith('demo-')));
    persist(sessions.filter(session=>!session.name?.startsWith('DEMO ')));
    persistAssessmentQuestions(assessmentQuestions.filter(question=>!question.id?.toString().startsWith('demo-')));
    persistAssessments(assessments.filter(assessment=>!assessment.id?.toString().startsWith('demo-')));
    persistAssessmentAttempts(assessmentAttempts.filter(attempt=>!attempt.id?.toString().startsWith('demo-')));
    persistAttendance(attendance.filter(entry=>!entry.id?.toString().startsWith('demo-')));
    showToast('Demo data deleted');
  };

  const filtered = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter(s => (pillarFilter==='all' || s.pillar===pillarFilter) && (modeFilter==='all' || s.mode===modeFilter));
  }, [sessions, pillarFilter, modeFilter]);
  const fellowWeeks = academySettings?.fellowWeeks || WEEKS;
  const academyWeeks = useMemo(() => {
    const start = academySettings?.startDate, end = academySettings?.endDate;
    if (!start || !end) return null;
    const s = new Date(start+'T00:00:00'); s.setDate(s.getDate() - s.getDay() - 7); // snap to Sunday of the week BEFORE
    const e = new Date(end+'T00:00:00');
    const diffDays = Math.floor((e - s) / (24*60*60*1000));
    const count = Math.floor(diffDays / 7) + 1;
    if (count < 1 || count > 30) return null;
    return Array.from({length:count}, (_,i) => i);
  }, [academySettings?.startDate, academySettings?.endDate]);
  const weeks = academyWeeks || WEEKS;
  const afaGroups = [...new Set(
    (planners||[]).filter(p=>AFA_ROLES.includes(p.role)).flatMap(p=>[p.group||'', p.name||'']).filter(Boolean)
      .concat((roster||[]).map(r=>(r.afaGroup||'').trim()).filter(Boolean))
)];
  const calendarSessions = auth.role === 'fellow' ? filtered.filter(session => fellowWeeks.includes(session.week) && isSessionVisibleToFellow(session, auth, roster, rooms)) : filtered;

  const openRequests = (requests||[]).filter(r=>!r.resolved).length;

  if (!loaded || !sessions || !roster || !planners || !requests || !rooms || !pillars || !academySettings || !assessments || !assessmentQuestions || !assessmentAttempts || !attendance) {
    return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'400px',color:'#8A96A3',fontFamily:FONT}}>Loading schedule…</div>;
  }

  return (
    <div className="wa14-app min-h-screen flex flex-col" style={{fontFamily:FONT, background:'#EFF3F4', color:'#1B2733'}}>
      <div className="flex flex-1 min-h-screen">
        <Sidebar tab={tab} setTab={setTab} isAdmin={isAdmin} isFullAdmin={isFullAdmin} isSuperadmin={isSuperadmin} openRequests={openRequests} />
        <div className="flex-1 min-w-0">
        <TopBar
          tab={tab} isFullAdmin={isFullAdmin} auth={auth} onLogout={onLogout}
          onExport={exportExcel} onImport={importExcel} onReset={resetSeed} onAdd={()=>setEditing('new')}
        />
        {toast && <div className={toastStyle}>{toast}</div>}
        <div className="pt-5 px-6 pb-10">
        {(tab==='calendar' || tab==='sessions') && (
          <FilterBar pillarFilter={pillarFilter} setPillarFilter={setPillarFilter} modeFilter={modeFilter} setModeFilter={setModeFilter} pillars={pillars} />
        )}

        {tab==='calendar' && (
          <>
          {auth.role === 'fellow' && <><FellowOverview sessions={calendarSessions} auth={auth} rooms={rooms} attendance={attendance} onAttendance={entry=>persistAttendance([...attendance,entry])} /><FellowAssessments assessments={assessments} questions={assessmentQuestions} attempts={assessmentAttempts} auth={auth} sessions={sessions} onAttemptsChange={persistAssessmentAttempts} /></>}
          <CalendarView
            sessions={calendarSessions} activeWeek={activeWeek} setActiveWeek={setActiveWeek}
            hiddenDays={hiddenDays} setHiddenDays={setHiddenDays}
            weeks={weeks} startDate={academySettings?.startDate || null}
            academySettings={academySettings} onSettingsChange={isFullAdmin ? next => persistSettings(next) : null}
            fellowWeeks={fellowWeeks} onFellowWeeksChange={isFullAdmin ? next => persistSettings({...academySettings,fellowWeeks:next}) : null}
            onPlace={isFullAdmin ? (session, date, start) => setPlacement({session, date, start}) : null}
            onSelect={setViewing} onDrop={isFullAdmin ? (session, date, start) => {
              saveSession({...session, date, start, weekday:new Date(date+'T00:00:00').toLocaleDateString(undefined,{weekday:'long'}), week:weekForDate(date, academySettings?.startDate), calendared:true});
            } : null} auth={auth} roster={roster} rooms={rooms} pillars={pillars}
          />
          </>
        )}
        {tab==='sessions' && isAdmin && (
          <SessionsTable sessions={filtered} search={sessionSearch} setSearch={setSessionSearch} weekFilter={weekFilter} setWeekFilter={setWeekFilter} onEdit={setEditing} onDelete={deleteSession} rooms={rooms} weeks={weeks} onAssignRoom={(session, roomIds)=>saveSession({...session, roomIds})} />
        )}
        {tab==='summary' && isAdmin && <TimeSummary sessions={filtered} weeks={weeks} />}
        {tab==='fellows' && isFullAdmin && <RosterPanel roster={roster} staff={planners} onChange={persistRoster} onAccount={addAccount} showToast={showToast} />}
        {tab==='planners' && isSuperadmin && <PlannerPanel planners={planners} onChange={persistPlanners} onAccount={addAccount} showToast={showToast} />}
        {tab==='rooms' && isFullAdmin && <RoomsPanel rooms={rooms} roster={roster} onChange={persistRoomsAndRoster} showToast={showToast} />}
        {tab==='pillars' && isFullAdmin && <PillarsPanel pillars={pillars} onChange={persistPillars} showToast={showToast} />}
        {tab==='requests' && isFullAdmin && <RequestsPanel requests={requests} onResolve={resolveRequest} onDelete={deleteRequest} />}
        {tab==='assessments' && canEditAssessments && <LocalAssessmentsPanel assessments={assessments} sessions={sessions} roster={roster} rooms={rooms} onAssessmentsChange={persistAssessments} showToast={showToast} />}
        {tab==='review' && canEditAssessments && <ParagraphReviewPanel attempts={assessmentAttempts} assessments={assessments} roster={roster} sessions={sessions} auth={auth} onAttemptsChange={persistAssessmentAttempts} showToast={showToast} />}
        {tab==='analytics' && canEditAssessments && <ExpandedAnalyticsPanel sessions={sessions} attendance={attendance} attempts={assessmentAttempts} assessments={assessments} roster={roster} afaGroups={afaGroups} onSeedDemo={seedDemo} onDeleteDemo={deleteDemo} />}
      </div>
        </div>
      </div>

      {isAdmin && editing && (
        <EditPanel session={editing==='new' ? blankSession() : editing} onSave={saveSession} onDelete={isFullAdmin && editing!=='new' ? deleteSession : null} onClose={()=>setEditing(null)} canEditSchedule={isFullAdmin} pillars={pillars} rooms={rooms} staff={planners} weeks={weeks} startDate={academySettings?.startDate || null} />
      )}
      {isFullAdmin && placement && <PlacementPanel sessions={sessions} initial={placement} onSave={(session, date, start, end) => { saveSession({...session, date, start, end, weekday:new Date(date+'T00:00:00').toLocaleDateString(undefined,{weekday:'long'}), week:weekForDate(date, academySettings?.startDate) ?? activeWeek, calendared:true}); setPlacement(null); }} onClose={()=>setPlacement(null)} />}
      {isFullAdmin && assigning && <AssignmentPanel session={assigning} rooms={rooms} onSave={(next)=>{saveSession(next); setAssigning(null);}} onClose={()=>setAssigning(null)} />}
      {viewing && <ViewPanel session={viewing} auth={auth} rooms={rooms} onAssign={()=>setAssigning(viewing)} onRequestUpdate={requestUpdate} onClose={()=>setViewing(null)} />}
    </div>
  );
}

function blankSession(){
  return { id:newId(), week:0, date:'', weekday:'', start:'', end:'', name:'', pillar:PILLARS[0], mode:'Sync', facilitators:[], rooms:[], resources:[], outcomes:[], notes:'', fellowNotes:'', afaGroup:'', calendared:false };
}

const toastStyle = 'fixed top-4 right-6 bg-[#1B2733] text-white px-4 py-2.5 rounded-md text-[13px] z-[200] shadow-lg';

function Sidebar({ tab, setTab, isAdmin, isFullAdmin, isSuperadmin, openRequests }){
  const [open, setOpen] = useState(false);
  const tabs = [
    {id:'calendar', label:'Calendar', icon:CalendarIcon},
    ...(isAdmin ? [{id:'sessions', label:'Sessions', icon:TableIcon}] : []),
    ...(isFullAdmin ? [
      {id:'summary', label:'Time Summary', icon:BarChart3},
      {id:'fellows', label:'Fellows', icon:UserPlus},
      {id:'rooms', label:'Rooms', icon:DoorOpen},
      {id:'pillars', label:'Pillars', icon:ShieldCheck},
      {id:'requests', label:'Requests'+(openRequests?' ('+openRequests+')':''), icon:MessageSquare},
    ] : []),
    ...(isAdmin ? [{id:'assessments', label:'Assessments', icon:ClipboardText}] : []),
    ...(isAdmin ? [{id:'review', label:'Review', icon:ShieldCheck}] : []),
    ...(isAdmin ? [{id:'analytics', label:'Analytics', icon:BarChart3}] : []),
    ...(isSuperadmin ? [{id:'planners', label:'WA Staff', icon:ShieldCheck}] : []),
  ];
  return (
    <nav className={`shrink-0 bg-[#1B2733] text-[#C7D2DA] flex flex-col sticky top-0 self-stretch overflow-hidden transition-all duration-200 ease-out ${open ? 'w-[196px]' : 'w-[54px]'}`}>
      <button onClick={()=>setOpen(o=>!o)} title="Toggle menu" className={`bg-transparent border-none text-[#9FB0BE] cursor-pointer py-3 text-xl leading-none ${open ? 'text-right pr-3' : 'text-center'}`}>{open ? '‹' : '›'}</button>
      {tabs.map(t => {
        const Icon = t.icon; const active = tab===t.id;
        return (
          <button key={t.id} onClick={()=>setTab(t.id)} title={t.label} className={`flex items-center gap-2.5 border-none px-3 py-3 cursor-pointer text-[13px] whitespace-nowrap w-full text-left ${active ? 'bg-[#1F6F78] text-white font-semibold' : 'bg-transparent text-[#C7D2DA] font-medium'}`}><Icon size={17}/>{open && <span>{t.label}</span>}</button>
        );
      })}
    </nav>
  );
}

function TopBar({ tab, isFullAdmin, auth, onLogout, onExport, onImport, onReset, onAdd }){
  return (
    <div className="bg-white border-b border-[#DDE2E6] px-6 flex items-center justify-between flex-wrap gap-3">
      <div className="py-2.5 min-w-[210px]"><div className="font-extrabold text-xl leading-tight">Training and Design</div><div className="text-[11.5px] text-[#8A96A3] mt-[3px]">Teach For Bangladesh</div></div>
      <div className="flex items-center gap-3.5 py-3">
        {isFullAdmin && (
          <div className="flex gap-2">
            {(tab==='calendar' || tab==='sessions') && <button onClick={onAdd} className={btnPrimary}><Plus size={14}/> Add session</button>}
            <button onClick={onImport} className={btnSecondary}><Upload size={14}/> Import Excel</button>
            <button onClick={onExport} className={btnSecondary}><Download size={14}/> Export Excel</button>
            <button onClick={onReset} className={btnGhost}><RotateCcw size={14}/> Reset</button>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-[#8A96A3] border-l border-[#EEF0F2] pl-3.5">
          <span>{auth.email} · {ROLE_LABEL[auth.role]}</span>
          <button onClick={onLogout} title="Switch user" className="bg-transparent border-none cursor-pointer text-[#8A96A3] flex"><LogOut size={14}/></button>
        </div>
      </div>
    </div>
  );
}

const btnBase = 'inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-md px-3 py-2 cursor-pointer border border-transparent';
const btnPrimary = btnBase + ' bg-[#1F6F78] text-white';
const btnSecondary = btnBase + ' bg-white text-[#1B2733] border-[#C9CDD2]';
const btnGhost = btnBase + ' bg-transparent text-[#5B6672]';
const selectStyle = 'px-2.5 py-1.5 rounded-md border border-[#C9CDD2] text-[13px] bg-white';

function FilterBar({ pillarFilter, setPillarFilter, modeFilter, setModeFilter, pillars }){
  return (
    <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16, flexWrap:'wrap'}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{fontSize:12.5, color:'#5B6672'}}>Pillar</span>
        <select value={pillarFilter} onChange={e=>setPillarFilter(e.target.value)} className={selectStyle}>
          <option value="all">All pillars</option>{(pillars||DEFAULT_PILLARS).map(p => <option key={p.id||p.name} value={p.name}>{p.name}</option>)}
        </select>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{fontSize:12.5, color:'#5B6672'}}>Mode</span>
        <select value={modeFilter} onChange={e=>setModeFilter(e.target.value)} className={selectStyle}>
          <option value="all">All modes</option>{MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {(pillarFilter!=='all' || modeFilter!=='all') && (
        <button onClick={()=>{setPillarFilter('all'); setModeFilter('all');}} className={btnGhost+' px-2 py-1 text-xs'}>Clear filters</button>
      )}
    </div>
  );
}

function CalendarView({ sessions, activeWeek, setActiveWeek, hiddenDays, setHiddenDays, weeks = WEEKS, startDate, academySettings, onSettingsChange, fellowWeeks, onFellowWeeksChange, onSelect, onDrop, onPlace, auth, roster, rooms, pillars }){
  // Anchor: Sunday of the week BEFORE the academy start date's week (so week 00 is the full week before).
  // Fallback to first session date, then hardcoded default.
  const anchorIso = (() => {
    if (startDate) { const s = new Date(startDate+'T00:00:00'); s.setDate(s.getDate() - s.getDay() - 7); return toIsoDate(s); }
    const withDate = sessions.filter(s => s.date).sort((a,b)=>a.date.localeCompare(b.date));
    if (withDate.length) { const s = new Date(withDate[0].date+'T00:00:00'); s.setDate(s.getDate() - s.getDay() - 7); return toIsoDate(s); }
    return '2026-10-18';
  })();
  const anchorDate = new Date(anchorIso+'T00:00:00');
  anchorDate.setDate(anchorDate.getDate() + (activeWeek||0)*7);
  const days = Array.from({length:7}, (_,index) => {
    const date = new Date(anchorDate);
    date.setDate(anchorDate.getDate()+index);
    const iso = toIsoDate(date);
    return [iso, date.toLocaleDateString(undefined,{weekday:'long'})];
  });
  const weekLabel = (w) => {
    const s = new Date(anchorIso+'T00:00:00'); s.setDate(s.getDate() + w*7);
    const e = new Date(s); e.setDate(s.getDate()+6);
    const fmt = d => d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
    return fmt(s)+' – '+fmt(e);
  };
  const visibleDays = days.filter(([d]) => !hiddenDays[d]);
  const hours = [];
  for (let m=GRID_START; m<GRID_END; m+=60) hours.push(m);
  const totalHeight = (GRID_END-GRID_START)*PX_PER_MIN;
  const weekSessions = sessions.filter(s => days.some(d => d[0] === s.date) || s.week === (activeWeek||0));

  return (
    <div>
      {onSettingsChange && (
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:12,fontSize:12.5,color:'#5B6672',background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:'10px 14px'}}>
          <b>Academy dates</b>
          <label style={{display:'flex',alignItems:'center',gap:5}}>Start <input type="date" className={selectStyle} value={academySettings?.startDate||''} onChange={e=>onSettingsChange({...academySettings, startDate:e.target.value})} /></label>
          <label style={{display:'flex',alignItems:'center',gap:5}}>End <input type="date" className={selectStyle} value={academySettings?.endDate||''} onChange={e=>onSettingsChange({...academySettings, endDate:e.target.value})} /></label>
          <span>{weeks && weeks.length ? (academySettings?.startDate ? weeks.length+' week'+(weeks.length===1?'':'s') : '') : 'Set both dates to generate the calendar'}</span>
        </div>
      )}
      {onFellowWeeksChange && <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:12,fontSize:12.5,color:'#5B6672'}}><b>Fellow-visible weeks</b>{weeks.map(w=><label key={w} style={{display:'flex',alignItems:'center',gap:4}}><input type="checkbox" checked={fellowWeeks.includes(w)} onChange={()=>onFellowWeeksChange(fellowWeeks.includes(w)?fellowWeeks.filter(item=>item!==w):[...fellowWeeks,w])}/>W{String(w).padStart(2,'0')}</label>)}</div>}
      <div style={{display:'flex', gap:6, marginBottom:14, flexWrap:'wrap'}}>
        {weeks.map(w => (
          <button key={w} onClick={()=>setActiveWeek(w)} style={{
            padding:'7px 14px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer',
            border: activeWeek===w ? '1px solid #1F6F78' : '1px solid #C9CDD2',
            background: activeWeek===w ? '#1F6F78' : '#fff', color: activeWeek===w ? '#fff' : '#5B6672'
          }}>Week {String(w).padStart(2,'0')} · {weekLabel(w)}</button>
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
        <div className="flex bg-white rounded-lg border border-[#DDE2E6] overflow-hidden">
          <div className="w-14 shrink-0 border-r border-[#EEF0F2]">
            <div className="h-[46px] border-b border-[#EEF0F2] bg-[#F7F8F9]"></div>
            <div className="relative" style={{height:totalHeight}}>
              {hours.map(m => (<div key={m} className="absolute right-2 text-[10.5px] text-[#9AA5B1]" style={{top:(m-GRID_START)*PX_PER_MIN-6}}>{String(Math.floor(m/60)).padStart(2,'0')}:00</div>))}
            </div>
          </div>
          {visibleDays.map(([d,wd]) => {
            const di = days.findIndex(x=>x[0]===d);
            const prevDay = di>0 ? days[di-1][0] : null;
            const daySessions = weekSessions.filter(s=>s.date===d).sort((a,b)=>toMin(a.start)-toMin(b.start));
            const carryOver = prevDay ? weekSessions.filter(s=>s.date===prevDay && wrapsMidnight(s)) : [];
            return (
              <div key={d} className="flex-1 min-w-[150px] border-r border-[#EEF0F2]">
                <div className="h-[46px] box-border border-b border-[#EEF0F2] bg-[#F7F8F9] text-[12.5px] font-semibold text-center pt-[5px]">
                  {wd}<div className="font-normal text-[#8A96A3] text-[11px] leading-tight">{dateLabel(d)}</div>
                </div>
                <div className="relative" style={{height:totalHeight}} onClick={e=>{if(!onPlace || e.target!==e.currentTarget) return; const rect=e.currentTarget.getBoundingClientRect(); const minutes=Math.max(GRID_START, Math.min(GRID_END-15, GRID_START+Math.round((e.clientY-rect.top)/PX_PER_MIN/15)*15)); const start=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0'); onPlace(null,d,start);}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); const id=Number(e.dataTransfer.getData('sessionId')); const session=sessions.find(item=>item.id===id); if(!session || !onDrop) return; const rect=e.currentTarget.getBoundingClientRect(); const minutes=Math.max(GRID_START, Math.min(GRID_END-15, GRID_START+Math.round((e.clientY-rect.top)/PX_PER_MIN/15)*15)); const start=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0'); onDrop(session,d,start);}}>
                  {hours.map(m => (<div key={m} style={{position:'absolute', top:(m-GRID_START)*PX_PER_MIN, left:0, right:0, borderTop:'1px solid #F2F3F4'}} />))}
                  {carryOver.map(s => {
                    const height = Math.max(toMin(s.end)*PX_PER_MIN, 16);
                    const color = getPillarColor(s.pillar, pillars);
                    return (
                      <div key={s.id+'-cont'} draggable={!!onDrop} onDragStart={e=>e.dataTransfer.setData('sessionId',String(s.id))} onClick={()=>onSelect(s)} style={{
                        position:'absolute', top:0, left:3, right:3, height, background: color+'26', borderLeft:'3px solid '+color,
                        borderRadius:4, padding:'3px 6px', cursor:'pointer', overflow:'hidden', fontSize:10.5, lineHeight:1.25, fontStyle:'italic', opacity:0.85
                      }} title={s.name+' (continued from previous day)'}>
                        <div style={{fontWeight:600, color:'#1B2733'}}>{s.name} <span style={{fontWeight:400, color:'#8A96A3'}}>(cont.)</span></div>
                        {height>28 && <div style={{color:'#5B6672'}}>until {s.end}</div>}
                      </div>
                    );
                  })}
                  {daySessions.map(s => {
                    const start = toMin(s.start)||0;
                    const height = Math.max((wrapsMidnight(s) ? (24*60-start) : (((toMin(s.end)||start))-start))*PX_PER_MIN, 16);
                    const color = getPillarColor(s.pillar, pillars);
                    return (
                      <div key={s.id} draggable={!!onDrop} onDragStart={e=>e.dataTransfer.setData('sessionId',String(s.id))} onClick={()=>onSelect(s)} style={{
                        position:'absolute', top:start*PX_PER_MIN, left:3, right:3, height, background: color+'26', borderLeft:'3px solid '+color,
                        borderRadius:4, padding:'3px 6px', cursor:'pointer', overflow:'hidden', fontSize:10.5, lineHeight:1.25
                      }} title={s.name}>
                        <div style={{fontWeight:600, color:'#1B2733'}}>{s.name}</div>
                        {height>28 && <div style={{color:'#5B6672'}}>{s.start}–{s.end}</div>}
                        {height>42 && s.facilitators && s.facilitators.length>0 && (
                          <div style={{color:'#5B6672', display:'flex', alignItems:'center', gap:3, marginTop:1}}><Users size={9}/> {fmtFacilitators(s.facilitators, rooms)}</div>
                        )}
                        {height>56 && ((s.rooms||[]).length>0 || (s.roomIds||[]).length>0) && (
                          <div style={{color:'#5B6672', display:'flex', alignItems:'center', gap:3, marginTop:1}}><DoorOpen size={9}/> {getVisibleRooms(s, auth, roster, rooms).map(r=>r.name+' · '+(r.facilitator||'Facilitator not set')).join(', ') || 'Room not assigned'}</div>
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
      <div style={{marginTop:18, background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, padding:16}}>
        <div style={{fontSize:13, fontWeight:700, marginBottom:10}}>Session list</div>
        <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:18}}>{weekSessions.slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')||toMin(a.start)-toMin(b.start)).map(s=><div key={s.id} onClick={()=>onSelect(s)} style={{display:'flex',justifyContent:'space-between',gap:10,padding:'8px 0',borderBottom:'1px solid #EEF0F2',fontSize:12.5,cursor:'pointer'}}><span>{s.name}</span><span style={{color:'#8A96A3',whiteSpace:'nowrap'}}>{dateLabel(s.date)} · {s.start}–{s.end}</span></div>)}</div>
        <div style={{fontSize:13, fontWeight:700, marginBottom:10}}>Unscheduled sessions</div>
        <div style={{display:'flex', flexWrap:'wrap', gap:8}}>{sessions.filter(s=>!s.date).map(s=><div key={s.id} draggable={!!onDrop} onDragStart={e=>e.dataTransfer.setData('sessionId',String(s.id))} onClick={()=>onPlace ? onPlace(s, '', '') : onSelect(s)} style={{padding:'8px 10px', border:'1px solid #DDE2E6', borderLeft:'3px solid '+getPillarColor(s.pillar,pillars), borderRadius:5, cursor:onDrop?'grab':'pointer', fontSize:12.5}}>{s.name || '(untitled)'}</div>)}</div>
        {sessions.filter(s=>!s.date).length===0 && <div style={{fontSize:12.5,color:'#8A96A3'}}>All sessions are scheduled.</div>}
      </div>
    </div>
  );
}

function PlacementPanel({ sessions, initial, onSave, onClose }){
  const [sessionId,setSessionId]=useState(initial.session?.id || '');
  const [date,setDate]=useState(initial.date || '');
  const [start,setStart]=useState(initial.start || '09:00');
  const [end,setEnd]=useState(initial.session?.start && initial.session?.end ? initial.session.end : '10:00');
  const selected = sessions.find(item=>String(item.id)===String(sessionId));
  return <div style={{position:'fixed',inset:0,background:'rgba(27,39,51,.4)',display:'flex',justifyContent:'flex-end',zIndex:110}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{width:380,maxWidth:'92vw',background:'#fff',height:'100%',overflowY:'auto',padding:22}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><div style={{fontWeight:700}}>Place session on calendar</div><button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer'}}><X size={18}/></button></div><Field label="Session"><select className={inputStyle} value={sessionId} onChange={e=>setSessionId(e.target.value)}><option value="">Choose a session</option>{sessions.map(item=><option key={item.id} value={item.id}>{item.name || '(untitled)'}</option>)}</select></Field><Field label="Date"><input type="date" className={inputStyle} value={date} onChange={e=>setDate(e.target.value)}/></Field><div style={{display:'flex',gap:10}}><Field label="Start time" style={{flex:1}}><input type="time" className={inputStyle} value={start} onChange={e=>setStart(e.target.value)}/></Field><Field label="End time" style={{flex:1}}><input type="time" className={inputStyle} value={end} onChange={e=>setEnd(e.target.value)}/></Field></div><button disabled={!selected || !date || !start || !end} onClick={()=>onSave(selected,date,start,end)} className={btnPrimary+' w-full justify-center mt-[12px]'} style={{opacity:selected&&date&&start&&end?1:0.5}}>Add to calendar</button></div></div>;
}

function getPillarColor(name, pillars){
  return (pillars||[]).find(p=>p.name===name)?.color || PILLAR_COLOR[name] || '#C9CDD2';
}

function getVisibleRooms(session, auth, roster, rooms){
  const assigned = (session.rooms||[]).concat((session.roomIds||[]).map(id=>(rooms||[]).find(room=>room.id===id)).filter(Boolean));
  if(auth.role!=='fellow') return assigned;
  return assigned.filter(room=>(room.fellowIds||[]).includes(roster.find(fellow=>fellow.email===auth.email)?.id));
}

function isSessionVisibleToFellow(session, auth, roster, rooms){
  const fellow = (roster||[]).find(item=>item.id===auth.fellowId || item.email===auth.email);
  const roomMatch = (session.roomIds||[]).some(id => (rooms||[]).find(room=>room.id===id)?.fellowIds?.includes(fellow?.id));
  const groupMatch = Boolean(auth.afaGroup && session.afaGroup && auth.afaGroup===session.afaGroup);
  return roomMatch || groupMatch;
}

function sessionDateTime(session, field){
  if (!session.date || !session[field]) return null;
  return new Date(`${session.date}T${session[field]}:00+06:00`);
}

function FellowOverview({ sessions, auth, rooms, attendance, onAttendance }){
  const now = new Date();
  const upcoming = sessions.filter(session=>sessionDateTime(session,'end') > now).sort((a,b)=>sessionDateTime(a,'start')-sessionDateTime(b,'start'));
  const current = upcoming.find(session=>sessionDateTime(session,'start') <= now && sessionDateTime(session,'end') > now);
  const next = current ? upcoming.find(session=>sessionDateTime(session,'start') > now) : upcoming[0];
  const checkIn = session => { const existing=attendance.find(entry=>entry.sessionId===session.id&&entry.fellowId===auth.fellowId); if(existing) return; const code=window.prompt('Enter the session attendance code'); if(code===null) return; if(code!==session.attendanceCode){window.alert('That attendance code is not correct.');return;} const start=sessionDateTime(session,'start'); const minutes=Math.floor((Date.now()-start.getTime())/60000); if(minutes>15){window.alert('Attendance is closed for this session.');return;} onAttendance({id:'attendance'+Date.now(),sessionId:session.id,fellowId:auth.fellowId,recordedAt:new Date().toISOString(),status:minutes<=5?'on_time':'late'}); };
  const card = (label, session) => <div style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:16,flex:1,minWidth:220}}><div style={{fontSize:11.5,color:'#8A96A3',fontWeight:600,marginBottom:6}}>{label}</div>{session ? <><div style={{fontWeight:700,fontSize:15}}>{session.name}</div><div style={{fontSize:12.5,color:'#5B6672',marginTop:5}}>{dateLabel(session.date)} · {session.start}–{session.end}</div><div style={{fontSize:12.5,color:'#5B6672',marginTop:5}}>{getVisibleRooms(session,auth,[{id:auth.fellowId,email:auth.email}],rooms).map(room=>room.name+' · '+(room.physicalLocation||room.meetingUrl||'Location not set')).join(', ') || 'Location not assigned'}</div>{session.attendanceCode && <button onClick={()=>checkIn(session)} className={btnSecondary+' mt-[10px]'}>{attendance.some(entry=>entry.sessionId===session.id&&entry.fellowId===auth.fellowId)?'Attendance recorded':'Give attendance'}</button>}</> : <div style={{fontSize:13,color:'#8A96A3'}}>No session</div>}</div>;
  return <div style={{marginBottom:18}}><div style={{fontSize:13,color:'#5B6672',marginBottom:10}}>AFA group: <b>{auth.afaGroup || 'Not assigned'}</b></div><div style={{display:'flex',gap:12,flexWrap:'wrap'}}>{card('Current session',current)}{card('Upcoming session',next)}</div></div>;
}

function LegacyFellowAssessments({ assessments, questions, attempts, auth, sessions, onAttemptsChange }){
  const [activeAttempt,setActiveAttempt]=useState(null);
  const fellowAssessments = assessments.filter(assessment=>{
    if(assessment.status!=='published') return false;
    const session = sessions.find(item=>String(item.id)===String(assessment.sessionId));
    if (!session) return false;
    const now = new Date();
    return (!assessment.startsAt || new Date(assessment.startsAt) <= now) && (!assessment.endsAt || new Date(assessment.endsAt) >= now) && (assessment.assignmentGroups||[]).some(group=>group.fellowIds?.includes(auth.fellowId));
  });
  const start = assessment => {
    const existing = attempts.find(attempt=>attempt.assessmentId===assessment.id && attempt.fellowId===auth.fellowId && attempt.status==='in_progress');
    if(existing){ setActiveAttempt(existing); return; }
    const availableQuestions = assessment.questions?.length ? assessment.questions : (assessment.questionIds||[]).map(id=>questions.find(question=>String(question.id)===String(id))).filter(Boolean);
    const order = effectiveQuestions({...assessment,questions:availableQuestions}, auth.fellowId, []).map(question=>question.id).length ? effectiveQuestions({...assessment,questions:availableQuestions}, auth.fellowId, []).map(question=>question.id) : availableQuestions.map(question=>question.id);
    if (!order.length) { window.alert('This assessment has no questions assigned to you.'); return; }
    const next = {id:'attempt'+Date.now(),assessmentId:assessment.id,fellowId:auth.fellowId,sessionId:assessment.sessionId,questionOrder:order,currentIndex:0,answers:{},startedAt:new Date().toISOString(),status:'in_progress'};
    onAttemptsChange([...attempts,next]); setActiveAttempt(next);
  };
  const saveAnswer = (questionId,value) => { const next={...activeAttempt,answers:{...activeAttempt.answers,[questionId]:value}}; setActiveAttempt(next); onAttemptsChange(attempts.map(attempt=>attempt.id===next.id?next:attempt)); };
  if(activeAttempt){ const assessment=assessments.find(item=>item.id===activeAttempt.assessmentId); const question=(assessment?.questions||questions).find(item=>item.id===activeAttempt.questionOrder[activeAttempt.currentIndex]); return <div style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:16,marginBottom:18,maxWidth:620}}><div style={{fontSize:12,color:'#8A96A3',marginBottom:6}}>{assessment?.title} · Question {activeAttempt.currentIndex+1} of {activeAttempt.questionOrder.length}</div><div style={{fontSize:15,fontWeight:700,marginBottom:12}}>{question?.text || 'Question unavailable'}</div>{question?.imageUrl && <img src={question.imageUrl} alt="Question" style={{maxWidth:'100%',maxHeight:220,objectFit:'contain',marginBottom:12}} />}{question.type==='paragraph' ? <textarea rows={6} className={inputStyle+' resize-y'} placeholder="Write your answer here…" value={activeAttempt.answers[question.id]||''} onChange={event=>saveAnswer(question.id,event.target.value)} /> : question?.options?.map(option=><label key={option.id} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,fontSize:13}}><input type={question.type==='multiple'||question.type==='check'?'checkbox':'radio'} name={question.id} checked={Array.isArray(activeAttempt.answers[question.id]) ? activeAttempt.answers[question.id].includes(option.id) : activeAttempt.answers[question.id]===option.id} onChange={event=>saveAnswer(question.id,question.type==='multiple'||question.type==='check' ? [...(activeAttempt.answers[question.id]||[]).filter(item=>item!==option.id), ...(event.target.checked?[option.id]:[])] : option.id)} />{option.text}</label>)}<button onClick={()=>{if(activeAttempt.currentIndex+1<activeAttempt.questionOrder.length){const next={...activeAttempt,currentIndex:activeAttempt.currentIndex+1};setActiveAttempt(next);onAttemptsChange(attempts.map(attempt=>attempt.id===next.id?next:attempt));}else{const paragraphReviews={};(assessment?.questions||questions).filter(q=>q.type==='paragraph'&&activeAttempt.questionOrder.includes(q.id)).forEach(q=>{if(!activeAttempt.reviews||!activeAttempt.reviews[q.id])paragraphReviews[q.id]={status:'pending_review',score:null,feedback:'',aiSuggestion:null};});const next={...activeAttempt,reviews:{...(activeAttempt.reviews||{}),...paragraphReviews},status:'submitted',submittedAt:new Date().toISOString()};onAttemptsChange(attempts.map(attempt=>attempt.id===next.id?next:attempt));setActiveAttempt(null);}}} className={btnPrimary+' mt-[10px]'}>{activeAttempt.currentIndex+1<activeAttempt.questionOrder.length?'Next question':'Submit assessment'}</button></div>; }
  return <div style={{marginBottom:18}}><div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Active assessments</div>{fellowAssessments.length ? fellowAssessments.map(assessment=><div key={assessment.id} style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:14,maxWidth:620,marginBottom:8,display:'flex',justifyContent:'space-between',gap:12}}><div><b>{assessment.title}</b><div style={{fontSize:12,color:'#5B6672',marginTop:4}}>{sessions.find(item=>String(item.id)===String(assessment.sessionId))?.name} · {assessment.questionIds?.length||0} questions</div></div><button onClick={()=>start(assessment)} className={btnPrimary}>Start</button></div>) : <div style={{fontSize:12.5,color:'#8A96A3'}}>No active assessments.</div>}</div>;
}

function FellowAssessments({ assessments, questions, attempts, auth, sessions, onAttemptsChange }){
  const [activeAttempt,setActiveAttempt]=useState(null);
  const available = assessments.filter(assessment => assessment.status==='published' && (!assessment.startsAt || new Date(assessment.startsAt)<=new Date()) && (!assessment.endsAt || new Date(assessment.endsAt)>=new Date()) && (assessment.assignmentGroups||[]).some(group=>(group.fellowIds||[]).includes(auth.fellowId)));
  const questionFor = (attempt, index) => {
    const assessment=assessments.find(item=>String(item.id)===String(attempt.assessmentId));
    return (assessment?.questions||questions).find(item=>String(item.id)===String(attempt.questionOrder[index]));
  };
  const start = assessment => {
    const existing=attempts.find(item=>item.assessmentId===assessment.id&&item.fellowId===auth.fellowId&&item.status==='in_progress');
    if(existing){setActiveAttempt(existing);return;}
    const assigned=effectiveQuestions(assessment,auth.fellowId,[]);
    if(!assigned.length){window.alert('This assessment has no questions assigned to you.');return;}
    const next={id:'attempt'+Date.now(),assessmentId:assessment.id,fellowId:auth.fellowId,sessionId:assessment.sessionId,questionOrder:assigned.map(question=>question.id),currentIndex:0,answers:{},startedAt:new Date().toISOString(),status:'in_progress'};
    onAttemptsChange([...attempts,next]);setActiveAttempt(next);
  };
  const update = patch => { const next={...activeAttempt,...patch};setActiveAttempt(next);onAttemptsChange(attempts.map(item=>item.id===next.id?next:item)); };
  const submit = () => {
    const assessment=assessments.find(item=>String(item.id)===String(activeAttempt.assessmentId));
    const reviews={...(activeAttempt.reviews||{})};
    (assessment?.questions||questions).filter(question=>question.type==='paragraph'&&activeAttempt.questionOrder.includes(question.id)).forEach(question=>{reviews[question.id]=reviews[question.id]||{status:'pending_review',score:null,feedback:'',aiSuggestion:null};});
    const next={...activeAttempt,reviews,status:'submitted',submittedAt:new Date().toISOString()};onAttemptsChange(attempts.map(item=>item.id===next.id?next:item));setActiveAttempt(null);
  };
  if(activeAttempt){const question=questionFor(activeAttempt,activeAttempt.currentIndex);const options=(question?.options||[]).map((option,index)=>typeof option==='string'?{id:`option-${question.id}-${index}`,text:option}:option);const answer=activeAttempt.answers[question?.id];return <div style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:16,marginBottom:18,maxWidth:620}}><div style={{fontSize:12,color:'#8A96A3',marginBottom:8}}>Question {activeAttempt.currentIndex+1} of {activeAttempt.questionOrder.length}</div>{question?.imageUrl&&<img src={normalizeImageUrl(question.imageUrl)} alt="Question" style={{display:'block',maxWidth:'100%',maxHeight:220,objectFit:'contain',marginBottom:12}}/>}<div style={{fontSize:15,fontWeight:700,marginBottom:12}}>{question?.text||'Question unavailable'}</div>{question?.type==='paragraph'?<textarea rows={6} className={inputStyle+' resize-y'} value={answer||''} placeholder="Write your answer here…" onChange={event=>update({answers:{...activeAttempt.answers,[question.id]:event.target.value}})}/>:options.map(option=><label key={option.id} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,fontSize:13}}><input type={question?.type==='single'?'radio':'checkbox'} name={question?.id} checked={Array.isArray(answer)?answer.includes(option.id):answer===option.id} onChange={event=>{const value=question.type==='single'?option.id:[...(answer||[]).filter(id=>id!==option.id),...(event.target.checked?[option.id]:[])];update({answers:{...activeAttempt.answers,[question.id]:value}});}}/>{option.text}</label>)}<button onClick={()=>activeAttempt.currentIndex+1<activeAttempt.questionOrder.length?update({currentIndex:activeAttempt.currentIndex+1}):submit()} className={btnPrimary+' mt-[10px]'}>{activeAttempt.currentIndex+1<activeAttempt.questionOrder.length?'Next question':'Submit assessment'}</button></div>}
  return <div style={{marginBottom:18}}><div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Active assessments</div>{available.map(assessment=><div key={assessment.id} style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:14,maxWidth:620,marginBottom:8,display:'flex',justifyContent:'space-between',gap:12}}><div><b>{assessment.title}</b><div style={{fontSize:12,color:'#5B6672',marginTop:4}}>{sessions.find(item=>String(item.id)===String(assessment.sessionId))?.name}</div></div><button onClick={()=>start(assessment)} className={btnPrimary}>Start</button></div>)}{!available.length&&<div style={{fontSize:12.5,color:'#8A96A3'}}>No active assessments.</div>}</div>;
}

function SessionsTable({ sessions, search, setSearch, weekFilter, setWeekFilter, onEdit, onDelete, rooms, weeks, onAssignRoom }){
  const rows = useMemo(() => {
    let r = sessions.slice();
    const query = search.trim().toLowerCase();
    if (query) r = r.filter(s => [s.name, s.date, s.pillar, s.mode, ...fmtFacilitators(s.facilitators, rooms).split(', '), ...(s.resources||[]).flatMap(resource => [resource.label, resource.url]), ...(s.roomIds||[]).map(id => rooms.find(room=>room.id===id)?.name)].filter(Boolean).join(' ').toLowerCase().includes(query));
    if (weekFilter!=='all') r = r.filter(s => weekFilter==='unscheduled' ? s.week==null : s.week===Number(weekFilter));
    r.sort((a,b) => (a.date||'zzzz').localeCompare(b.date||'zzzz') || (toMin(a.start)||9999)-(toMin(b.start)||9999));
    return r;
  }, [sessions, search, weekFilter, rooms]);

  return (
    <div>
      <div style={{marginBottom:14, display:'flex', alignItems:'center', gap:10}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search sessions, facilitators, rooms, resources" className={inputStyle+' w-[300px]! max-w-full'} aria-label="Search sessions" />
        <span style={{fontSize:13, color:'#5B6672'}}>Week</span>
        <select value={weekFilter} onChange={e=>setWeekFilter(e.target.value)} className={selectStyle}>
          <option value="all">All weeks</option>{(weeks||WEEKS).map(w => <option key={w} value={w}>Week {String(w).padStart(2,'0')}</option>)}<option value="unscheduled">Unscheduled</option>
        </select>
        <span style={{fontSize:12.5, color:'#8A96A3'}}>{rows.length} sessions</span>
      </div>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, overflow:'hidden'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
          <thead><tr style={{background:'#F7F8F9', textAlign:'left'}}>{['Date','Time','Session','Pillar','Mode','Facilitators','Rooms','Outcomes',''].map(h => (<th key={h} style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>{h}</th>))}</tr></thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.id} style={{borderBottom:'1px solid #EEF0F2'}}>
                <td style={{padding:'8px 12px', color:'#5B6672', whiteSpace:'nowrap'}}>{s.date ? dateLabel(s.date) : '—'}</td>
                <td style={{padding:'8px 12px', color:'#5B6672', whiteSpace:'nowrap'}}>{s.start ? s.start+'–'+s.end : '—'}</td>
                <td style={{padding:'8px 12px', fontWeight:500, cursor:'pointer'}} onClick={()=>onEdit(s)}>{s.name || '(untitled)'}</td>
                <td style={{padding:'8px 12px'}}><span style={{fontSize:11, padding:'2px 8px', borderRadius:12, background:(PILLAR_COLOR[s.pillar]||'#ccc')+'26', color:'#1B2733'}}>{s.pillar}</span></td>
                <td style={{padding:'8px 12px'}}><span style={{fontSize:11, padding:'2px 8px', borderRadius:12, background:(MODE_COLOR[s.mode]||'#ccc')+'26', color:MODE_COLOR[s.mode]||'#1B2733', fontWeight:600}}>{s.mode}</span></td>
                <td style={{padding:'8px 12px', color:'#5B6672'}}>{fmtFacilitators(s.facilitators, rooms) || '—'}</td>
                <td style={{padding:'8px 12px', color:'#5B6672'}}>{(s.rooms||[]).length ? s.rooms.map(r=>r.name).join(', ') : (s.roomIds||[]).map(id=>rooms.find(r=>r.id===id)?.name).filter(Boolean).join(', ') || '—'}</td>
                <td style={{padding:'8px 12px', color:'#5B6672'}}>{s.outcomes && s.outcomes.length ? s.outcomes.join('; ') : '—'}</td>
                <td style={{padding:'8px 12px', textAlign:'right', whiteSpace:'nowrap'}}>
                  <button onClick={()=>onEdit(s)} style={linkBtn}>Edit</button>
                  <select multiple value={s.roomIds||[]} onChange={e=>onAssignRoom(s,Array.from(e.target.selectedOptions,option=>option.value))} className={selectStyle+' ml-2.5 text-[11px] min-w-[90px]'} title="Assign rooms">{rooms.map(room=><option key={room.id} value={room.id}>{room.name}</option>)}</select>
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

function AssignmentPanel({ session, rooms, onSave, onClose }){
  const [selected, setSelected] = useState(session.roomIds||[]);
  const toggle = id => setSelected(ids=>ids.includes(id) ? ids.filter(item=>item!==id) : [...ids,id]);
  return <div style={{position:'fixed',inset:0,background:'rgba(27,39,51,.4)',display:'flex',justifyContent:'flex-end',zIndex:100}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{width:360,maxWidth:'92vw',background:'#fff',height:'100%',overflowY:'auto',padding:22}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><div style={{fontWeight:700}}>Assign session</div><button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer'}}><X size={18}/></button></div>
      <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>{session.name}</div><div style={{fontSize:12.5,color:'#8A96A3',marginBottom:18}}>Calendar placement is changed by dragging the session. Choose rooms here or from Sessions.</div>
      {rooms.map(room=><label key={room.id} style={{display:'flex',gap:8,alignItems:'center',padding:'10px 0',borderBottom:'1px solid #EEF0F2',fontSize:13}}><input type="checkbox" checked={selected.includes(room.id)} onChange={()=>toggle(room.id)}/><span><b>{room.name}</b><br/><span style={{fontSize:11.5,color:'#8A96A3'}}>{room.facilitator||'Facilitator not set'}</span></span></label>)}
      {rooms.length===0 && <div style={{fontSize:12.5,color:'#8A96A3'}}>Create rooms in the Rooms tab first.</div>}
      <button onClick={()=>onSave({...session,roomIds:selected})} className={btnPrimary+' w-full justify-center mt-5'}>Save assignments</button>
    </div>
  </div>;
}

function RoomsPanel({ rooms, roster, onChange, showToast }){
  const [draft,setDraft]=useState(null);
  const emptyRoom = () => ({id:'room'+Date.now(),name:'',facilitator:'',locationType:'physical',physicalLocation:'',onlinePlatform:'',meetingUrl:'',accessInstructions:'',fellowIds:[]});
  const save = room => { if(!room.name.trim()) return; onChange(rooms.some(item=>item.id===room.id) ? rooms.map(item=>item.id===room.id?room:item) : [...rooms,room]); setDraft(null); showToast('Room saved'); };
  const toggleFellow = id => setDraft(room=>({...room,fellowIds:(room.fellowIds||[]).includes(id) ? room.fellowIds.filter(item=>item!==id) : [...(room.fellowIds||[]),id]}));
  return <div><div style={{fontSize:13,color:'#5B6672',marginBottom:16}}>Create and edit rooms, assign Fellows, and add physical or online locations.</div><button onClick={()=>setDraft(emptyRoom())} className={btnPrimary+' mb-[18px]'}><Plus size={14}/> Add room</button>{draft && <div style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:18,maxWidth:560,marginBottom:18}}><Field label="Room name"><input className={inputStyle} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="Room A"/></Field><Field label="Facilitator"><input className={inputStyle} value={draft.facilitator} onChange={e=>setDraft({...draft,facilitator:e.target.value})} placeholder="Facilitator name"/></Field><Field label="Location type"><select className={inputStyle} value={draft.locationType||'physical'} onChange={e=>setDraft({...draft,locationType:e.target.value})}><option value="physical">Physical</option><option value="online">Online</option><option value="hybrid">Hybrid</option></select></Field>{draft.locationType!=='online' && <Field label="Physical location"><input className={inputStyle} value={draft.physicalLocation||''} onChange={e=>setDraft({...draft,physicalLocation:e.target.value})} placeholder="Building, floor, or room location"/></Field>}{draft.locationType!=='physical' && <><Field label="Online platform"><input className={inputStyle} value={draft.onlinePlatform||''} onChange={e=>setDraft({...draft,onlinePlatform:e.target.value})} placeholder="Zoom or Google Meet"/></Field><Field label="Meeting URL"><input type="url" className={inputStyle} value={draft.meetingUrl||''} onChange={e=>setDraft({...draft,meetingUrl:e.target.value})} placeholder="https://..."/></Field><Field label="Access instructions"><textarea className={inputStyle+' resize-y'} rows={2} value={draft.accessInstructions||''} onChange={e=>setDraft({...draft,accessInstructions:e.target.value})}/></Field></> }<Field label="Fellows"><div style={{display:'flex',flexWrap:'wrap',gap:'5px 12px'}}>{roster.map(f=><label key={f.id} style={{fontSize:12}}><input type="checkbox" checked={(draft.fellowIds||[]).includes(f.id)} onChange={()=>toggleFellow(f.id)}/> {f.name}</label>)}</div></Field><div style={{display:'flex',gap:8}}><button onClick={()=>save(draft)} className={btnPrimary}>Save room</button><button onClick={()=>setDraft(null)} className={btnGhost}>Cancel</button></div></div>}{rooms.map(room=><div key={room.id} style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:14,marginBottom:8,maxWidth:560}}><b>{room.name}</b><div style={{fontSize:12,color:'#5B6672'}}>{room.facilitator||'Facilitator not set'} · {room.locationType||'physical'} · {room.physicalLocation||room.meetingUrl||'Location not set'} · {(room.fellowIds||[]).length} Fellows</div><button onClick={()=>setDraft({...room})} style={{...linkBtn,marginTop:8}}>Edit</button><button onClick={()=>onChange(rooms.filter(r=>r.id!==room.id))} style={{...linkBtn,color:'#B84C4C',marginTop:8,marginLeft:12}}>Delete</button></div>)}</div>;
}

function PillarsPanel({ pillars, onChange, showToast }){
  const list = pillars || [];
  const [name,setName]=useState(''); const [color,setColor]=useState('#1F6F78');
  const save = e => { e.preventDefault(); if(!name.trim()) return; onChange([...list,{id:'pillar'+Date.now(),name:name.trim(),color}]); setName('');showToast('Pillar added'); };
  const update = (id,key,value) => onChange(list.map(p=>p.id===id?{...p,[key]:value}:p));
  return <div><div style={{fontSize:13,color:'#5B6672',marginBottom:16}}>Edit pillar names and colors or add new Winter Academy pillars.</div><form onSubmit={save} style={{display:'flex',gap:8,alignItems:'end',marginBottom:18,maxWidth:560}}><input className={inputStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="New pillar name"/><input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{width:42,height:35}}/><button type="submit" className={btnPrimary}><Plus size={14}/> Add</button></form><div style={{display:'flex',flexDirection:'column',gap:8,maxWidth:560}}>{list.map(p=><div key={p.id} style={{display:'flex',gap:8,alignItems:'center',background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:10}}><input className={inputStyle} value={p.name} onChange={e=>update(p.id,'name',e.target.value)}/><input type="color" value={p.color} onChange={e=>update(p.id,'color',e.target.value)} style={{width:42,height:35}}/><button onClick={()=>onChange(list.filter(item=>item.id!==p.id))} style={{...linkBtn,color:'#B84C4C'}}>Delete</button></div>)}</div></div>;
}

const linkBtn = {background:'none', border:'none', color:'#1F6F78', fontSize:12.5, fontWeight:600, cursor:'pointer', padding:0};

function TimeSummary({ sessions, weeks }){
  const weekList = weeks || WEEKS;
  const scheduled = sessions.filter(s => s.calendared && s.start && s.end && s.week!=null);
  const byMode = {}; MODES.forEach(m => byMode[m] = {total:0, byWeek:{}});
  scheduled.forEach(s => {
    const dur = durationMin(s);
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
          <thead><tr style={{background:'#F7F8F9'}}><th style={{padding:'9px 12px', textAlign:'left', color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Mode</th>{weekList.map(w => <th key={w} style={{padding:'9px 10px', color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>W{String(w).padStart(2,'0')}</th>)}<th style={{padding:'9px 12px', color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Total</th></tr></thead>
          <tbody>
            {MODES.map(m => (
              <tr key={m} style={{borderBottom:'1px solid #EEF0F2'}}>
                <td style={{padding:'8px 12px', fontWeight:600, color:MODE_COLOR[m]}}>{m}</td>
                {weekList.map(w => <td key={w} style={{padding:'8px 10px', textAlign:'center', color:'#5B6672'}}>{fmtDur(byMode[m].byWeek[w]||0)}</td>)}
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

function Metric({ label, value }){
  return <div style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:16}}><div style={{fontSize:12,color:'#5B6672'}}>{label}</div><div style={{fontSize:26,fontWeight:700,marginTop:5}}>{value}</div></div>;
}

function ExpandedAnalyticsPanel({ sessions, attendance, attempts, assessments, roster, afaGroups, onSeedDemo, onDeleteDemo }){
  const [view,setView]=useState('attendance');
  const [track,setTrack]=useState('all'); const [city,setCity]=useState('all'); const [afa,setAfa]=useState('all');
  const fellows=roster.filter(fellow=>(track==='all'||fellow.track===track)&&(city==='all'||fellow.placementCity===city)&&(afa==='all'||fellow.afaGroup===afa));
  const ids=new Set(fellows.map(fellow=>fellow.id));
  const filteredAttendance=attendance.filter(entry=>ids.has(entry.fellowId));
  const filteredAttempts=attempts.filter(attempt=>ids.has(attempt.fellowId));
  const attendanceBySession=sessions.map(session=>({label:session.name,value:filteredAttendance.filter(entry=>entry.sessionId===session.id).length})).filter(row=>row.value||sessions.length<8);
  const max=Math.max(1,...attendanceBySession.map(row=>row.value));
  const scoreValues=filteredAttempts.map(attempt=>{
    const assessment=assessments.find(item=>String(item.id)===String(attempt.assessmentId));
    return Number(attempt.percentage ?? attempt.score ?? computeAttemptPercentage(attempt,assessment));
  }).filter(value=>Number.isFinite(value));
  const average=scoreValues.length ? Math.round(scoreValues.reduce((sum,value)=>sum+value,0)/scoreValues.length) : 0;
  const submission=roster.length ? Math.round(filteredAttempts.filter(attempt=>attempt.status==='submitted').length/Math.max(1,fellows.length)*100) : 0;
  return <div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}><button onClick={()=>setView('attendance')} className={view==='attendance'?btnPrimary:btnSecondary}>Attendance</button><button onClick={()=>setView('assessment')} className={view==='assessment'?btnPrimary:btnSecondary}>Assessments</button><button onClick={onSeedDemo} className={btnGhost}>Create demo data</button><button onClick={onDeleteDemo} className={btnGhost+' text-[#B84C4C]'}>Delete demo data</button></div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}><select className={selectStyle} value={track} onChange={event=>setTrack(event.target.value)}><option value="all">All tracks</option><option value="primary">Primary</option><option value="secondary">Secondary</option></select><select className={selectStyle} value={city} onChange={event=>setCity(event.target.value)}><option value="all">All placement cities</option>{[...new Set(roster.map(fellow=>fellow.placementCity).filter(Boolean))].map(value=><option key={value} value={value}>{value}</option>)}</select><select className={selectStyle} value={afa} onChange={event=>setAfa(event.target.value)}><option value="all">All AFA groups</option>{[...new Set([...(afaGroups||[]), ...roster.map(fellow=>fellow.afaGroup)].filter(Boolean))].map(value=><option key={value} value={value}>{value}</option>)}</select><span style={{fontSize:12.5,color:'#5B6672',alignSelf:'center'}}>{fellows.length} Fellows matched</span></div>{view==='attendance'?<><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12,maxWidth:780}}><Metric label="Attendance records" value={filteredAttendance.length}/><Metric label="On-time" value={filteredAttendance.filter(entry=>entry.status==='on_time').length}/><Metric label="Attendance %" value={`${fellows.length?Math.round(filteredAttendance.length/Math.max(1,fellows.length)*100):0}%`}/></div><div style={{marginTop:24,fontWeight:700}}>Attendance by session</div><div style={{display:'flex',alignItems:'end',gap:8,height:180,maxWidth:780,marginTop:12,padding:'12px 8px',background:'#fff',border:'1px solid #DDE2E6',borderRadius:8}}>{attendanceBySession.map(row=><div key={row.label} title={`${row.label}: ${row.value}`} style={{flex:1,minWidth:18,height:`${Math.max(8,row.value/max*100)}%`,background:'#1F6F78',borderRadius:'4px 4px 0 0'}} />)}</div></>:<><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12,maxWidth:780}}><Metric label="Submission %" value={`${submission}%`}/><Metric label="Average score %" value={`${average}%`}/><Metric label="Submitted attempts" value={filteredAttempts.filter(attempt=>attempt.status==='submitted').length}/></div><div style={{marginTop:24,fontWeight:700}}>Assessment score trend</div><div style={{display:'flex',alignItems:'end',gap:8,height:180,maxWidth:780,marginTop:12,padding:'12px 8px',background:'#fff',border:'1px solid #DDE2E6',borderRadius:8}}>{assessments.map(assessment=>{const values=filteredAttempts.filter(attempt=>attempt.assessmentId===assessment.id).map(attempt=>computeAttemptPercentage(attempt,assessment));const value=values.length?values.reduce((sum,item)=>sum+item,0)/values.length:0;return <div key={assessment.id} title={`${assessment.title}: ${Math.round(value)}%`} style={{flex:1,minWidth:18,height:`${Math.max(8,value)}%`,background:'#D97355',borderRadius:'4px 4px 0 0'}}/>})}</div><SessionAssessmentBreakdown fellows={fellows} sessions={sessions} assessments={assessments} attempts={filteredAttempts} roster={roster} /></>}</div>;
}

function SessionAssessmentBreakdown({ sessions, assessments, attempts, roster, fellows }){
  const findReview = (attempt, qid) => { const rev = attempt.reviews||{}; return rev[qid] ?? rev[String(qid)] ?? (Object.values(rev).find(rv => rv && rv.questionId!=null && String(rv.questionId)===String(qid)) || null); };
  const statusOfAttempt = (attempt, assessment) => {
    if (!attempt) return 'Not submitted';
    const paras = (assessment?.questions||[]).filter(q => q.type==='paragraph' && (attempt.questionOrder||[]).some(qid => String(qid)===String(q.id)));
    if (paras.some(q => { const rv = findReview(attempt, q.id); return !rv || (rv.status!=='reviewed' && rv.score==null); })) return 'Pending review';
    if (paras.some(q => { const rv = findReview(attempt, q.id); return rv && rv.status==='ai_suggested'; })) return 'AI suggested';
    return 'Reviewed';
  };
  const statusColor = s => s==='Reviewed' ? '#2D7A4F' : s==='Not submitted' ? '#8A96A3' : s==='AI suggested' ? '#9A6A16' : '#B84C4C';
  const questionCell = (attempt, question) => {
    if (!attempt) return '—';
    const points = Number(question.points)||1;
    if (question.type==='paragraph'){
      const rv = findReview(attempt, question.id);
      return rv && rv.score!=null ? `${Number(rv.score)}/${points}` : '—';
    }
    const answer = attempt.answers ? attempt.answers[question.id] : undefined;
    const correct = Array.isArray(question.correct) ? question.correct : [];
    let ok = false;
    if (typeof answer === 'string') ok = correct.includes(answer);
    else if (Array.isArray(answer) && correct.length) ok = correct.length===answer.length && correct.every(c => answer.includes(c));
    else if (Array.isArray(correct) && correct.length===0 && answer!=null) ok = true;
    return ok ? `${points}/${points}` : `0/${points}`;
  };
  return <div style={{marginTop:24}}>
    {sessions.map(session => {
      const sessionAssessments = (assessments||[]).filter(a => String(a.sessionId)===String(session.id));
      if (!sessionAssessments.length) return null;
      return (
        <div key={session.id} style={{marginBottom:26}}>
          <div style={{fontSize:14.5,fontWeight:700,marginBottom:10}}>{session.name||'Session'} <span style={{fontWeight:400,color:'#8A96A3',fontSize:12}}>{session.date ? '· '+dateLabel(session.date) : '· unscheduled'}</span></div>
          {sessionAssessments.map(assessment => {
            const assigned = new Set((assessment.assignmentGroups||[]).flatMap(g => g.fellowIds||[]).map(String));
            const assignedFellows = fellows.filter(f => assigned.has(String(f.id)));
            const list = assignedFellows.length ? assignedFellows : fellows;
            const paraCount = (assessment.questions||[]).filter(q => q.type==='paragraph').length;
            return (
              <div key={assessment.id} style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:14,marginBottom:14,maxWidth:960,overflowX:'auto'}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{assessment.title||'Untitled assessment'}</div>
                <div style={{fontSize:12,color:'#8A96A3',marginBottom:10}}>{list.length} fellow{list.length===1?'':'s'} · {(assessment.questions||[]).length} question{(assessment.questions||[]).length===1?'':'s'} · {paraCount} paragraph{paraCount===1?'':'s'}</div>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
                  <thead>
                    <tr style={{background:'#F7F8F9',textAlign:'left'}}>
                      <th style={{padding:8}}>Fellow</th>
                      <th style={{padding:8}}>Status</th>
                      <th style={{padding:8}}>Total</th>
                      {(assessment.questions||[]).map(q => <th key={q.id} style={{padding:8}} title={q.text}>{((q.text||'Question').slice(0,18))}{(q.text||'').length>18?'…':''} <span style={{fontWeight:400,color:'#8A96A3'}}>({Number(q.points)||1}p)</span></th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(f => {
                      const attempt = (attempts||[]).filter(a => String(a.assessmentId)===String(assessment.id) && String(a.fellowId)===String(f.id)).sort((x,y) => String(y.submittedAt||'').localeCompare(String(x.submittedAt||'')))[0];
                      const score = attempt ? computeAttemptScore(attempt, assessment) : { earned:0, total:0 };
                      const pct = attempt && score.total ? Math.round(score.earned/score.total*100) : null;
                      const st = statusOfAttempt(attempt, assessment);
                      return (
                        <tr key={f.id} style={{borderTop:'1px solid #EEF0F2'}}>
                          <td style={{padding:8,fontWeight:600}}>{f.name}</td>
                          <td style={{padding:8,color:statusColor(st),fontWeight:600}}>{st}</td>
                          <td style={{padding:8,fontWeight:700}}>{pct==null ? '—' : `${pct}% (${score.earned}/${score.total})`}</td>
                          {(assessment.questions||[]).map(q => <td key={q.id} style={{padding:8,color:'#5B6672'}}>{questionCell(attempt, q)}</td>)}
                        </tr>
                      );
                    })}
                    {list.length===0 && <tr><td colSpan={3+((assessment.questions||[]).length)} style={{padding:10,color:'#8A96A3'}}>No fellows match the current filters.</td></tr>}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      );
    })}
  </div>;
}

// ---- Paragraph review + AI assistance -------------------------------------
// Follow-up: deploy a Google Apps Script Web App (deployed as "Anyone with the link")
// that calls Gemini, and paste its URL below. The Gemini API key stays inside Apps
// Script — it must NEVER be placed in this React codebase.
const AI_SUGGEST_ENDPOINT = '';
async function suggestParagraphScore(question, answer){
  try {
    if (!AI_SUGGEST_ENDPOINT) return { ok:false, error:'AI endpoint not configured. Deploy the Apps Script proxy and add its URL to AI_SUGGEST_ENDPOINT.' };
    const response = await fetch(AI_SUGGEST_ENDPOINT, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ question:question.text, rubric:question.rubric||'', answer:answer||'', maxPoints:Number(question.points)||1 }),
    });
    if (!response.ok) return { ok:false, error:'AI endpoint returned '+response.status+'. Check the Apps Script deployment.' };
    const data = await response.json();
    return { ok:true, suggestion:{ suggestedScore:Number(data.suggestedScore)||0, confidence:Number(data.confidence)||0, feedback:data.feedback||'', status:data.status||'ai_suggested' } };
  } catch (error) {
    return { ok:false, error:'AI suggestion unavailable ('+error.message+').' };
  }
}

function computeAttemptScore(attempt, assessment){
  const reviews = attempt.reviews || {};
  const findReview = qid => reviews[qid] ?? reviews[String(qid)] ?? (Object.values(reviews).find(rv => rv && rv.questionId!=null && String(rv.questionId)===String(qid)) || null);
  let earned = 0, total = 0;
  (attempt.questionOrder||[]).forEach(qid => {
    const q = (assessment?.questions||[]).find(item => String(item.id)===String(qid));
    if (!q) return;
    const points = Number(q.points) || 1;
    total += points;
    const answer = attempt.answers ? attempt.answers[qid] : undefined;
    const review = findReview(qid);
    if (q.type==='paragraph') {
      if (review && review.score != null) earned += Math.max(0, Math.min(Number(review.score)||0, points));
    } else {
      const correct = Array.isArray(q.correct) ? q.correct : [];
      let ok = false;
      if (typeof answer === 'string') ok = correct.includes(answer);
      else if (Array.isArray(answer) && correct.length) ok = correct.length===answer.length && correct.every(c => answer.includes(c));
      else if (Array.isArray(correct) && correct.length===0 && answer!=null) ok = true;
      if (ok) earned += points;
    }
  });
  return { earned, total };
}
function computeAttemptPercentage(attempt, assessment){
  const { earned, total } = computeAttemptScore(attempt, assessment);
  return total ? Math.round(earned/total*100) : 0;
}

function ParagraphReviewPanel({ attempts, assessments, roster, sessions, auth, onAttemptsChange, showToast }){
  const [assessmentFilter, setAssessmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [drafts, setDrafts] = useState({});
  const draftKey = (aId, qId) => String(aId)+'__'+String(qId);
  const getReview = (attempt, qid) => { const rev = attempt.reviews||{}; return rev[qid] ?? rev[String(qid)] ?? (Object.values(rev).find(rv => rv && rv.questionId!=null && String(rv.questionId)===String(qid)) || null); };
  const reportDraft = (r) => drafts[draftKey(r.attempt.id, r.question.id)];
  const setDraft = (r, patch) => {
    const key = draftKey(r.attempt.id, r.question.id);
    setDrafts(d => ({ ...d, [key]: { ...(reportDraft(r)||{score:'',feedback:''}), ...patch } }));
  };

  const rows = attempts
    .filter(a => a.status==='submitted')
    .flatMap(attempt => {
      const assessment = assessments.find(x => String(x.id)===String(attempt.assessmentId));
      const fellow = roster.find(x => String(x.id)===String(attempt.fellowId));
      return (attempt.questionOrder||[]).map(qid => {
        const question = (assessment?.questions||[]).find(x => String(x.id)===String(qid));
        return { attempt, assessment, fellow, session:sessions.find(s=>String(s.id)===String(attempt.sessionId)), question, answer:(attempt.answers||{})[qid], review:getReview(attempt, qid) };
      }).filter(r => r.question && r.question.type==='paragraph' && (r.answer||'').trim().length>0);
    })
    .filter(r => {
      if (assessmentFilter!=='all' && String(r.attempt.assessmentId)!==String(assessmentFilter)) return false;
      const draft = reportDraft(r);
      const reviewed = (draft && draft.saved) || (r.review?.status==='reviewed' && r.review?.answer===r.answer);
      const suggested = !reviewed && ((draft && draft.aiSuggestion) || r.review?.status==='ai_suggested');
      const pending = !reviewed && !suggested;
      if (statusFilter==='pending' && !pending) return false;
      if (statusFilter==='suggested' && !suggested) return false;
      if (statusFilter==='reviewed' && !reviewed) return false;
      return true;
    });

  const askAI = async (r) => {
    setDraft(r, { fetching:true, aiError:null });
    const res = await suggestParagraphScore(r.question, r.answer);
    setDraft(r, { fetching:false });
    if (!res.ok) { setDraft(r, { aiError:res.error }); return; }
    const s = res.suggestion;
    setDraft(r, { score:String(s.suggestedScore), feedback:s.feedback, aiSuggestion:s, aiError:null, saved:false });
    const attempt = { ...r.attempt, reviews:{ ...(r.attempt.reviews||{}), [String(r.question.id)]:{ ...(r.review||{}), status:'ai_suggested', answer:r.answer, aiSuggestion:s, questionId:r.question.id } } };
    onAttemptsChange(attempts.map(a => a.id===attempt.id ? attempt : a));
  };
  const saveRow = (r) => {
    const draft = reportDraft(r)||{};
    const max = Number(r.question.points)||1;
    const score = Number(draft.score);
    if (draft.score==='' || isNaN(score) || score<0) { window.alert('Enter a score between 0 and '+max+'.'); return; }
    const attempt = { ...r.attempt, reviews:{ ...(r.attempt.reviews||{}), [String(r.question.id)]:{ status:'reviewed', score:Math.min(score, max), feedback:(draft.feedback||'').trim(), reviewer:auth.email||auth.name||'Staff', reviewedAt:new Date().toISOString(), answer:r.answer, aiSuggestion:draft.aiSuggestion, questionId:r.question.id } } };
    onAttemptsChange(attempts.map(a => a.id===attempt.id ? attempt : a));
    setDraft(r, { saved:true });
    if (showToast) showToast('Review saved ✓ — score added to the fellow\'s total.');
  };
  const statusOf = r => {
    const draft = reportDraft(r);
    if ((draft && draft.saved) || r.review?.status==='reviewed') return 'reviewed';
    if ((draft && draft.aiSuggestion) || r.review?.status==='ai_suggested') return 'suggested';
    return 'pending';
  };
  return <div><div style={{fontSize:13,color:'#5B6672',marginBottom:16}}>Review paragraph responses. AI suggestions are optional; only a staff member can publish a score.</div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}><select className={selectStyle} value={assessmentFilter} onChange={event=>setAssessmentFilter(event.target.value)}><option value="all">All assessments</option>{assessments.map(assessment=><option key={assessment.id} value={assessment.id}>{assessment.title||'Untitled assessment'}</option>)}</select><select className={selectStyle} value={statusFilter} onChange={event=>setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending review</option><option value="suggested">AI suggested</option><option value="reviewed">Reviewed</option></select><span style={{fontSize:12.5,color:'#5B6672',alignSelf:'center'}}>{rows.length} response{rows.length===1?'':'s'}</span></div>{rows.map(r=>{const draft=reportDraft(r)||{score:r.review?.score??'',feedback:r.review?.feedback??'',aiSuggestion:r.review?.aiSuggestion};const status=statusOf(r);const max=Number(r.question.points)||1;return <div key={draftKey(r.attempt.id,r.question.id)} style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:16,marginBottom:12,maxWidth:860}}><div style={{display:'flex',justifyContent:'space-between',gap:12,marginBottom:10}}><div><b>{r.fellow?.name||r.attempt.fellowId}</b><div style={{fontSize:12,color:'#5B6672',marginTop:3}}>{r.assessment?.title||'Assessment'} · {r.session?.name||'Session unavailable'} · {max} points</div></div><span style={{fontSize:11.5,fontWeight:700,color:status==='reviewed'?'#2D7A4F':status==='suggested'?'#9A6A16':'#5B6672'}}>{status==='reviewed'?'Reviewed':status==='suggested'?'AI suggested':'Pending review'}</span></div><div style={{fontWeight:600,marginBottom:6}}>{r.question.text}</div>{r.question.rubric&&<div style={{fontSize:12,color:'#5B6672',marginBottom:6}}>Rubric: {r.question.rubric}</div>}{r.question.expectedConcepts?.length>0&&<div style={{fontSize:12,color:'#5B6672',marginBottom:8}}>Expected concepts: {r.question.expectedConcepts.join(', ')}</div>}<div style={{whiteSpace:'pre-wrap',background:'#F7F8F9',borderRadius:6,padding:10,fontSize:13,marginBottom:10}}>{r.answer}</div>{draft.aiSuggestion&&<div style={{fontSize:12.5,background:'#FFF8E8',border:'1px solid #F0D9A0',borderRadius:6,padding:9,marginBottom:10}}>AI suggestion: {draft.aiSuggestion.suggestedScore}/{max} · confidence {Math.round((draft.aiSuggestion.confidence||0)*100)}%<br/>{draft.aiSuggestion.feedback}</div>}<div style={{display:'flex',gap:10,alignItems:'end',flexWrap:'wrap'}}><Field label={`Score (max ${max})`} style={{width:130,marginBottom:0}}><input type="number" min="0" max={max} step="0.5" className={inputStyle} value={draft.score} onChange={event=>setDraft(r,{score:event.target.value,saved:false})}/></Field><Field label="Feedback" style={{flex:'1 1 260px',marginBottom:0}}><textarea rows={2} className={inputStyle+' resize-y'} value={draft.feedback} onChange={event=>setDraft(r,{feedback:event.target.value,saved:false})}/></Field><button disabled={draft.fetching} onClick={()=>askAI(r)} className={btnSecondary}>{draft.fetching?'Getting suggestion…':'Get AI suggestion'}</button><button onClick={()=>saveRow(r)} className={btnPrimary}>Approve & save</button></div>{draft.aiError&&<div style={{fontSize:12,color:'#B84C4C',marginTop:8}}>{draft.aiError}</div>}</div>})}{rows.length===0&&<div style={{padding:'30px 0',color:'#8A96A3'}}>No paragraph responses match these filters.</div>}</div>;
}

function AnalyticsPanel({ sessions, attendance, attempts, onSeedDemo, onDeleteDemo }){
  const onTime=attendance.filter(entry=>entry.status==='on_time').length;
  const late=attendance.filter(entry=>entry.status==='late').length;
  const completed=attempts.filter(attempt=>attempt.status==='submitted').length;
  return <div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}><button onClick={onSeedDemo} className={btnSecondary}>Create demo data</button><button onClick={onDeleteDemo} className={btnSecondary+' text-[#B84C4C]'}>Delete demo data</button></div><div style={{fontSize:13,color:'#5B6672',marginBottom:16}}>Attendance and assessment overview for Staff.</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12,maxWidth:780}}><div style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:16}}><div style={{fontSize:12,color:'#5B6672'}}>On-time attendance</div><div style={{fontSize:26,fontWeight:700,marginTop:5}}>{onTime}</div></div><div style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:16}}><div style={{fontSize:12,color:'#5B6672'}}>Late attendance</div><div style={{fontSize:26,fontWeight:700,marginTop:5}}>{late}</div></div><div style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:16}}><div style={{fontSize:12,color:'#5B6672'}}>Completed assessments</div><div style={{fontSize:26,fontWeight:700,marginTop:5}}>{completed}</div></div></div><div style={{marginTop:24,fontSize:13,fontWeight:700}}>Session attendance</div><div style={{marginTop:8,background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,overflow:'hidden',maxWidth:780}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}><thead><tr style={{background:'#F7F8F9',textAlign:'left'}}><th style={{padding:9}}>Session</th><th style={{padding:9}}>On time</th><th style={{padding:9}}>Late</th></tr></thead><tbody>{sessions.map(session=><tr key={session.id} style={{borderTop:'1px solid #EEF0F2'}}><td style={{padding:9}}>{session.name}</td><td style={{padding:9}}>{attendance.filter(entry=>entry.sessionId===session.id&&entry.status==='on_time').length}</td><td style={{padding:9}}>{attendance.filter(entry=>entry.sessionId===session.id&&entry.status==='late').length}</td></tr>)}</tbody></table></div></div>;
}

function ViewPanel({ session, auth, rooms, onAssign, onRequestUpdate, onClose }){
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
        <DetailRow label="Facilitators">{fmtFacilitators(session.facilitators, rooms) || '—'}</DetailRow>
        <DetailRow label="Session rooms">{getVisibleRooms(session, auth, [{id:auth.fellowId,email:auth.email}], rooms).map(r=>r.name+' · '+(r.facilitator||'Facilitator not set')).join(', ') || '—'}</DetailRow>
        {auth.role !== 'fellow' && <button onClick={onAssign} className={btnSecondary+' w-full justify-center mt-1'}>Assign rooms</button>}

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

        {auth.role !== 'fellow' && session.outcomes && session.outcomes.length>0 && (
          <div style={{marginTop:18}}>
            <div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:8}}>Outcomes</div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {session.outcomes.map((outcome, idx) => (
                <div key={idx} style={{display:'flex', alignItems:'flex-start', gap:8, fontSize:12.5, color:'#1B2733', lineHeight:1.4}}>
                  <span style={{flexShrink:0, color:'#1F6F78', fontWeight:600}}>{idx+1}.</span>
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {auth.role !== 'fellow' && session.notes && (
          <div style={{marginTop:18}}>
            <div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:6}}>Planner notes</div>
            <div style={{fontSize:12.5, color:'#1B2733', whiteSpace:'pre-wrap', lineHeight:1.4}}>{session.notes}</div>
          </div>
        )}
        {auth.role === 'fellow' && session.fellowNotes && (
          <div style={{marginTop:18}}>
            <div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:6}}>Notes</div>
            <div style={{fontSize:12.5, color:'#1B2733', whiteSpace:'pre-wrap', lineHeight:1.4}}>{session.fellowNotes}</div>
          </div>
        )}

        <div style={{marginTop:22, paddingTop:18, borderTop:'1px solid #EEF0F2'}}>
          {!reqOpen ? (
            <button onClick={()=>setReqOpen(true)} className={btnSecondary+' w-full justify-center'}><MessageSquare size={14}/> Request an update</button>
          ) : sent ? (
            <div style={{fontSize:12.5, color:'#1F6F78', textAlign:'center', padding:'8px 0'}}>Request sent — thanks!</div>
          ) : (
            <div>
              <div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:6}}>What needs updating?</div>
              <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} placeholder="e.g. The exit ticket link is broken, or the time has changed…" className={inputStyle+' resize-y'} />
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button onClick={submitRequest} className={btnPrimary+' flex-1 justify-center'}><Send size={13}/> Send request</button>
                <button onClick={()=>{setReqOpen(false); setMsg('');}} className={btnGhost}>Cancel</button>
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

function RosterPanel({ roster, staff, onChange, onAccount, showToast }){
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [afaGroup, setAfaGroup] = useState(''); const [track, setTrack] = useState(''); const [grade, setGrade] = useState(''); const [placementCity, setPlacementCity] = useState(''); const [error, setError] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false); const [bulkText, setBulkText] = useState('');
  const afaStaff = (staff||[]).filter(p=>(p.role==='afa' || p.role==='afa_lead') && p.name);
  const legacyGroups = [...new Set((roster||[]).map(r=>(r.afaGroup||'').trim()).filter(Boolean))];
  const groupOptions = [...new Set([...afaStaff.map(p=>p.group || p.name), ...legacyGroups].map(g=>(g||'').trim()).filter(Boolean))];
  const groupLabel = g => { const p = afaStaff.find(x=>(x.group||x.name)===g); return p ? (p.group && p.group!==p.name ? p.name+' ('+p.group+')' : p.name) : g; };

  const addOne = (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!name.trim()) { setError('Enter a name.'); return; }
    if (!FELLOW_EMAIL_RE.test(em)) { setError('Email must look like firstname.lastname@teachforbangladesh.org'); return; }
    if (roster.some(r => r.email.toLowerCase()===em)) { setError('That email is already on the roster.'); return; }
    const fellow = { id: 'f'+Date.now(), name: name.trim(), email: em, afaGroup:afaGroup.trim(), track:track.toLowerCase(), grade:grade.trim(), placementCity:placementCity.trim(), roomIds:[] };
    onChange([...roster, fellow]); onAccount(fellow, 'fellow');
    setName(''); setEmail(''); setAfaGroup(''); setTrack(''); setGrade(''); setPlacementCity(''); setError(''); showToast('Fellow added');
  };
  const removeOne = (id) => { onChange(roster.filter(r=>r.id!==id)); showToast('Fellow removed'); };
  const editOne = (fellow) => { const name=window.prompt('Fellow name',fellow.name); if(!name?.trim()) return; const email=window.prompt('Fellow email',fellow.email); if(!email?.trim()) return; const afa=window.prompt('AFA group',fellow.afaGroup||'') ?? (fellow.afaGroup || ''); const next={...fellow,name:name.trim(),email:email.trim().toLowerCase(),afaGroup:afa.trim(),track:(window.prompt('Track: primary or secondary',fellow.track||'') || fellow.track || '').toLowerCase(),grade:window.prompt('Grade',fellow.grade||'') || fellow.grade || '',placementCity:window.prompt('Placement city',fellow.placementCity||'') || fellow.placementCity || '',roomIds:fellow.roomIds||[]}; onChange(roster.map(item=>item.id===fellow.id?next:item)); onAccount(next,'fellow'); showToast('Fellow updated'); };
  const importBulk = () => {
    const lines = bulkText.split('\n').map(l=>l.trim()).filter(Boolean);
    let added = 0, skipped = 0; const next = [...roster];
    lines.forEach(line => {
      const parts = line.split(',').map(p=>p.trim());
      if (parts.length < 2) { skipped++; return; }
      const [nm, em] = parts; const emLower = em.toLowerCase();
      if (!FELLOW_EMAIL_RE.test(emLower) || next.some(r=>r.email.toLowerCase()===emLower)) { skipped++; return; }
      const fellow = { id: 'f'+Date.now()+added, name: nm, email: emLower, track:(parts[2]||'').toLowerCase(), grade:parts[3]||'', placementCity:parts[4]||'', afaGroup:parts[5]||'', roomIds:(parts[6]||'').split('|').filter(Boolean) };
      next.push(fellow); onAccount(fellow, 'fellow'); added++;
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
          <div style={{flex:'1 1 160px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Name</div><input className={inputStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="Fellow's full name" /></div>
          <div style={{flex:'1 1 220px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Email</div><input className={inputStyle} value={email} onChange={e=>setEmail(e.target.value)} placeholder="firstname.lastname@teachforbangladesh.org" /></div>
          <div style={{flex:'1 1 130px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Track</div><select className={inputStyle} value={track} onChange={e=>setTrack(e.target.value)}><option value="">Track</option><option value="primary">Primary</option><option value="secondary">Secondary</option></select></div><div style={{flex:'1 1 90px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Grade</div><input className={inputStyle} value={grade} onChange={e=>setGrade(e.target.value)} placeholder="Grade" /></div><div style={{flex:'1 1 130px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Placement city</div><input className={inputStyle} value={placementCity} onChange={e=>setPlacementCity(e.target.value)} placeholder="City" /></div><div style={{flex:'1 1 150px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>AFA group</div><select className={inputStyle} value={afaGroup} onChange={e=>setAfaGroup(e.target.value)}><option value="">Assign an AFA…</option>{groupOptions.map(g=><option key={g} value={g}>{groupLabel(g)}</option>)}</select></div>
          <button type="submit" className={btnPrimary+' h-[35px]'}><Plus size={14}/> Add</button>
        </form>
        {error && <div style={{color:'#B84C4C', fontSize:12, marginTop:8}}>{error}</div>}
        <button onClick={()=>setBulkOpen(o=>!o)} className={btnGhost+' px-0 py-1 mt-3.5 text-[12.5px]'}>{bulkOpen ? 'Hide bulk import' : 'Bulk import (paste a list)'}</button>
        {bulkOpen && (
          <div style={{marginTop:10}}>
            <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} placeholder="name,email,track,grade,placementCity,afaGroup,roomId|roomId" rows={5} className={inputStyle+' resize-y font-mono text-xs'} />
            <button onClick={importBulk} className={btnSecondary+' mt-2'}>Import list</button>
          </div>
        )}
      </div>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, overflow:'hidden', maxWidth:520}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
          <thead><tr style={{background:'#F7F8F9', textAlign:'left'}}><th style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Name</th><th style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Track / Grade</th><th style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>City / AFA</th><th style={{padding:'9px 12px', borderBottom:'1px solid #DDE2E6'}}></th></tr></thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.id} style={{borderBottom:'1px solid #EEF0F2'}}>
                <td style={{padding:'8px 12px'}}>{r.name}<div style={{fontSize:11,color:'#8A96A3'}}>{r.email}</div></td><td style={{padding:'8px 12px', color:'#5B6672'}}>{r.track||'—'}{r.grade?' · '+r.grade:''}</td><td style={{padding:'8px 12px', color:'#5B6672'}}>{r.placementCity||'—'}{r.afaGroup?' · '+r.afaGroup:''}</td>
                <td style={{padding:'8px 12px', textAlign:'right'}}><button onClick={()=>editOne(r)} style={linkBtn}>Edit</button><button onClick={()=>removeOne(r.id)} style={{background:'none', border:'none', color:'#B84C4C', cursor:'pointer', display:'inline-flex', marginLeft:10}}><Trash2 size={14}/></button></td>
              </tr>
            ))}
            {sorted.length===0 && (<tr><td colSpan={4} style={{padding:'20px 12px', textAlign:'center', color:'#8A96A3'}}>No Fellows added yet.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlannerPanel({ planners, onChange, onAccount, showToast }){
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [error, setError] = useState('');
  const [role, setRole] = useState('academy_lead');
  const [group, setGroup] = useState('');
  const [access, setAccess] = useState('full');

  const accessLabel = id => (STAFF_ACCESS.find(a=>a.id===id)||{}).label || 'Resources only';

  const addOne = (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!name.trim()) { setError('Enter a name.'); return; }
    if (!STAFF_EMAIL_RE.test(em)) { setError('Email must look like name@teachforbangladesh.org'); return; }
    if (em === SUPERADMIN_EMAIL) { setError('That address is already the built-in Superadmin.'); return; }
    if (planners.some(p => p.email.toLowerCase()===em)) { setError('That email is already on the WA Staff list.'); return; }
    const planner = { id:'p'+Date.now(), name:name.trim(), email:em, role, access, group: AFA_ROLES.includes(role) ? group.trim() : '' };
    onChange([...planners, planner]); onAccount(planner, role);
    setName(''); setEmail(''); setRole('academy_lead'); setAccess('full'); setGroup(''); setError(''); showToast('Staff added');
  };
  const removeOne = (id) => { onChange(planners.filter(p=>p.id!==id)); showToast('Staff removed'); };
  const editOne = (planner) => { const name=window.prompt('Staff name',planner.name); if(!name?.trim()) return; const email=window.prompt('Staff email',planner.email); if(!email?.trim()) return; const role=window.prompt('Role (academy_lead | afa_lead | curriculum_specialist | afa | placement_ops)',planner.role||'') || planner.role || 'academy_lead'; const access=window.prompt('Access (full | resources_assessments | resources)',planner.access||'full') || planner.access || 'resources'; const group=window.prompt('AFA group name (for AFA roles)',planner.group||'') ?? (planner.group||''); const next={...planner,name:name.trim(),email:email.trim().toLowerCase(),role,group,access}; onChange(planners.map(item=>item.id===planner.id?next:item)); onAccount(next,next.role||'academy_lead'); showToast('Staff updated'); };
  const sorted = planners.slice().sort((a,b)=>a.name.localeCompare(b.name));

  return (
    <div>
      <div style={{marginBottom:18, fontSize:13, color:'#5B6672', maxWidth:520}}>
        WA Staff manage the calendar, roster and assessments. Academy Fellow Advisors (AFA) each carry a Group name that Fellows and sessions are assigned to.
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
          <div style={{flex:'1 1 160px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Name</div><input className={inputStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="Staff full name" /></div>
          <div style={{flex:'1 1 220px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Email</div><input className={inputStyle} value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@teachforbangladesh.org" /></div>
          <div style={{flex:'1 1 150px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Role</div><select className={inputStyle} value={role} onChange={e=>setRole(e.target.value)}>{STAFF_ROLES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
          <div style={{flex:'1 1 150px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>Access</div><select className={inputStyle} value={access} onChange={e=>setAccess(e.target.value)}>{STAFF_ACCESS.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}</select></div>
          {AFA_ROLES.includes(role) && <div style={{flex:'1 1 150px'}}><div style={{fontSize:12, color:'#5B6672', fontWeight:600, marginBottom:5}}>AFA group name</div><input className={inputStyle} value={group} onChange={e=>setGroup(e.target.value)} placeholder="e.g. AFA Group 1" /></div>}
          <button type="submit" className={btnPrimary+' h-[35px]'}><Plus size={14}/> Add</button>
        </form>
        {error && <div style={{color:'#B84C4C', fontSize:12, marginTop:8}}>{error}</div>}
      </div>
      <div style={{background:'#fff', border:'1px solid #DDE2E6', borderRadius:8, overflow:'hidden', maxWidth:520}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
          <thead><tr style={{background:'#F7F8F9', textAlign:'left'}}><th style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Name</th><th style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Role</th><th style={{padding:'9px 12px', fontWeight:600, color:'#5B6672', borderBottom:'1px solid #DDE2E6'}}>Access</th><th style={{padding:'9px 12px', borderBottom:'1px solid #DDE2E6'}}></th></tr></thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.id} style={{borderBottom:'1px solid #EEF0F2'}}>
                <td style={{padding:'8px 12px'}}>{p.name}<div style={{fontSize:11,color:'#8A96A3'}}>{p.email}</div></td><td style={{padding:'8px 12px', color:'#5B6672'}}>{ROLE_LABEL[p.role]||'Staff'}{p.group?' · '+p.group:''}</td><td style={{padding:'8px 12px', color:'#5B6672'}}>{accessLabel(p.access)}</td>
                <td style={{padding:'8px 12px', textAlign:'right'}}><button onClick={()=>editOne(p)} style={linkBtn}>Edit</button><button onClick={()=>removeOne(p.id)} style={{background:'none', border:'none', color:'#B84C4C', cursor:'pointer', display:'inline-flex', marginLeft:10}}><Trash2 size={14}/></button></td>
              </tr>
            ))}
            {sorted.length===0 && (<tr><td colSpan={4} style={{padding:'20px 12px', textAlign:'center', color:'#8A96A3'}}>No additional WA Staff yet.</td></tr>)}
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
                  <button onClick={()=>onResolve(r.id, !r.resolved)} className={btnGhost+' text-[11.5px] px-2 py-1'}>{r.resolved ? 'Reopen' : 'Mark resolved'}</button>
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

function LocalAssessmentsPanel({ assessments, sessions, roster, rooms, onAssessmentsChange, showToast }){
  const [editing, setEditing] = useState(null);
  const saveAssessment = assessment => {
    const nextGroups = (assessment.assignmentGroups||[]).map(group=>({...group,fellowIds:resolveAssignmentGroup(group, roster)}));
    const next = {...assessment, assignmentGroups:nextGroups, questionIds:(assessment.questions||[]).map(question=>question.id)};
    onAssessmentsChange(assessments.some(item=>item.id===next.id) ? assessments.map(item=>item.id===next.id?next:item) : [...assessments,next]);
    setEditing(null); showToast('Assessment saved');
  };
  const removeAssessment = id => { onAssessmentsChange(assessments.filter(item=>item.id!==id)); showToast('Assessment removed'); };
  return <div>
    <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}><button onClick={()=>setEditing(newAssessment(sessions))} className={btnPrimary}><Plus size={14}/> Create assessment</button></div>
    <div style={{fontSize:13,color:'#5B6672',marginBottom:18}}>Each assessment is linked to one session, but its questions and Fellow assignments are managed independently.</div>
    {assessments.map(assessment=><div key={assessment.id} style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:14,maxWidth:760,marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{fontWeight:700}}>{assessment.title || 'Untitled assessment'}</div><div style={{fontSize:12,color:'#5B6672',marginTop:4}}>{sessions.find(session=>String(session.id)===String(assessment.sessionId))?.name || 'Session not found'} · {assessment.status}</div><div style={{fontSize:12,color:'#5B6672',marginTop:4}}>{(assessment.questions||[]).length} questions · {(assessment.assignmentGroups||[]).length} assignment groups · {(assessment.assignmentGroups||[]).reduce((count,group)=>count+(group.fellowIds||[]).length,0)} Fellows</div></div><div style={{display:'flex',gap:10}}><button onClick={()=>setEditing(assessment)} style={linkBtn}>Edit</button><button onClick={()=>removeAssessment(assessment.id)} style={{...linkBtn,color:'#B84C4C'}}>Delete</button></div></div></div>)}
    {assessments.length===0 && <div style={{padding:'30px 0',color:'#8A96A3'}}>No assessments created yet.</div>}
    {editing && <AssessmentOwnedEditor assessment={editing} sessions={sessions} roster={roster} rooms={rooms} onSave={saveAssessment} onClose={()=>setEditing(null)} />}
  </div>;
}

function AssessmentOwnedEditor({ assessment, sessions, roster, rooms, onSave, onClose }){
  const [form,setForm]=useState({...assessment,questions:(assessment.questions||[]).map(question=>normalizeQuestion(question,assessment.id)),assignmentGroups:(assessment.assignmentGroups||[]).map(group=>({...group,roomIds:[...(group.roomIds||[])],questionIds:[...(group.questionIds||[])]}))});
  const [questionEditing,setQuestionEditing]=useState(null);
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const updateGroup=(id,key,value)=>set('assignmentGroups',form.assignmentGroups.map(group=>group.id===id?{...group,[key]:value}:group));
  const addGroup=()=>set('assignmentGroups',[...form.assignmentGroups,{id:'group'+Date.now(),track:'',afaGroup:'',placementCity:'',roomIds:[],fellowIds:[],questionIds:[]}]);
  const saveQuestion=question=>{set('questions',form.questions.some(item=>item.id===question.id)?form.questions.map(item=>item.id===question.id?question:item):[...form.questions,question]);setQuestionEditing(null);};
  const removeQuestion=id=>set('questions',form.questions.filter(question=>question.id!==id));
  const save=()=>{
    if(!form.title.trim() || !form.sessionId || !form.questions.length){window.alert('Add a title, session, and at least one question.');return;}
    if(form.questions.some(question=>!question.text.trim() || (question.type==='paragraph' ? false : !question.options.filter(Boolean).length || !question.correct.length))){window.alert('Every choice question needs text, options, and at least one selected correct answer.');return;}
    onSave({...form,questions:form.questions.map(question=>normalizeQuestion(question,form.id)),updatedAt:new Date().toISOString()});
  };
  return <div style={{position:'fixed',inset:0,background:'rgba(27,39,51,.4)',display:'flex',justifyContent:'flex-end',zIndex:120}} onClick={onClose}><div onClick={event=>event.stopPropagation()} style={{width:560,maxWidth:'94vw',background:'#fff',height:'100%',overflowY:'auto',padding:22}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><b>{assessment.title?'Edit assessment':'Create assessment'}</b><button onClick={onClose} style={{background:'none',border:'none'}}><X size={18}/></button></div><Field label="Title"><input className={inputStyle} value={form.title} onChange={event=>set('title',event.target.value)} placeholder="Assessment title"/></Field><Field label="Session"><select className={inputStyle} value={form.sessionId} onChange={event=>set('sessionId',event.target.value)}>{sessions.map(session=><option key={session.id} value={session.id}>{session.name}</option>)}</select></Field><Field label="Description"><textarea className={inputStyle+' resize-y'} rows={2} value={form.description||''} onChange={event=>set('description',event.target.value)}/></Field><div style={{display:'flex',gap:10}}><Field label="Starts" style={{flex:1}}><input type="datetime-local" className={inputStyle} value={form.startsAt||''} onChange={event=>set('startsAt',event.target.value)}/></Field><Field label="Ends" style={{flex:1}}><input type="datetime-local" className={inputStyle} value={form.endsAt||''} onChange={event=>set('endsAt',event.target.value)}/></Field></div><Field label="Status"><select className={inputStyle} value={form.status} onChange={event=>set('status',event.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select></Field>
    <div style={{fontWeight:700,fontSize:13,margin:'18px 0 8px'}}>Questions in this assessment</div>{form.questions.map((question,index)=><div key={question.id} style={{border:'1px solid #DDE2E6',borderRadius:6,padding:10,marginBottom:7,display:'flex',justifyContent:'space-between',gap:8}}><div><b>{index+1}. {question.text||'Untitled question'}</b><div style={{fontSize:11.5,color:'#5B6672'}}>{question.type} · {question.correct.length} correct answer{question.correct.length===1?'':'s'}{question.targetGroupIds?.length?' · targeted':''}</div></div><div style={{display:'flex',gap:8}}><button onClick={()=>setQuestionEditing(question)} style={linkBtn}>Edit</button><button onClick={()=>removeQuestion(question.id)} style={{...linkBtn,color:'#B84C4C'}}>Remove</button></div></div>)}<button onClick={()=>setQuestionEditing(newQuestion(form.id))} className={btnSecondary}><Plus size={14}/> Add question</button>
    <div style={{fontWeight:700,fontSize:13,margin:'22px 0 8px'}}>Assignment groups</div>{form.assignmentGroups.map(group=><div key={group.id} style={{border:'1px solid #DDE2E6',borderRadius:6,padding:10,marginBottom:8}}><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><select className={inputStyle+' flex-[1_1_120px]'} value={group.track||''} onChange={event=>updateGroup(group.id,'track',event.target.value)}><option value="">All tracks</option><option value="primary">Primary</option><option value="secondary">Secondary</option></select><input className={inputStyle+' flex-[1_1_120px]'} value={group.afaGroup||''} onChange={event=>updateGroup(group.id,'afaGroup',event.target.value)} placeholder="AFA group (optional)"/><input className={inputStyle+' flex-[1_1_120px]'} value={group.placementCity||''} onChange={event=>updateGroup(group.id,'placementCity',event.target.value)} placeholder="Placement city (optional)"/></div><select multiple className={inputStyle+' min-h-[64px] mt-[8px]'} value={group.roomIds||[]} onChange={event=>updateGroup(group.id,'roomIds',Array.from(event.target.selectedOptions,option=>option.value))}>{rooms.map(room=><option key={room.id} value={room.id}>{room.name}</option>)}</select><div style={{fontSize:11.5,color:'#5B6672',marginTop:5}}>{resolveAssignmentGroup(group,roster).length} Fellows match this group</div></div>)}<button onClick={addGroup} className={btnGhost+' px-1 py-0'}>+ Add assignment group</button><button onClick={save} className={btnPrimary+' w-full justify-center mt-[20px]'}>Save assessment</button>{questionEditing && <OwnedQuestionEditor question={questionEditing} groups={form.assignmentGroups} onSave={saveQuestion} onClose={()=>setQuestionEditing(null)}/>}</div></div>;
}

function OwnedQuestionEditor({ question, groups, onSave, onClose }){
  const initialOptions = (question.options || ['']).map((option, index) => typeof option === 'string' ? {id:`option-${question.id}-${index}`,text:option} : {id:option.id || `option-${question.id}-${index}`,text:option.text || ''});
  const [form,setForm]=useState({...question,options:initialOptions,correct:[...(question.correct||[])],targetGroupIds:[...(question.targetGroupIds||[])],imageUrl:normalizeImageUrl(question.imageUrl)});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const updateOption=(id,key,value)=>set('options',form.options.map(option=>option.id===id?{...option,[key]:value}:option));
  const removeOption=id=>{const options=form.options.filter(option=>option.id!==id);set('options',options);set('correct',form.correct.filter(answer=>options.some(option=>option.id===answer)));};
  const toggleCorrect=id=>set('correct',form.correct.includes(id)?form.correct.filter(answer=>answer!==id):form.type==='single'?[id]:[...form.correct,id]);
  const save=()=>{
    const options=form.options.map(option=>({...option,text:option.text.trim()})).filter(option=>option.text);
    if(!form.text.trim()){window.alert('Add question text.');return;}
    if(form.type!=='paragraph' && (options.length<2 || !form.correct.some(answer=>options.some(option=>option.id===answer)))){window.alert('Add at least two options and select the correct answer beside the option.');return;}
    onSave({...form,options,correct:form.type==='paragraph'?[]:form.correct.filter(answer=>options.some(option=>option.id===answer)),imageUrl:normalizeImageUrl(form.imageUrl),gradingMode:form.type==='paragraph'?'manual_review':'automatic',updatedAt:new Date().toISOString()});
  };
  return <div style={{position:'fixed',inset:0,background:'rgba(27,39,51,.4)',display:'flex',justifyContent:'flex-end',zIndex:130}} onClick={onClose}><div onClick={event=>event.stopPropagation()} style={{width:500,maxWidth:'94vw',background:'#fff',height:'100%',overflowY:'auto',padding:22}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><b>Question editor</b><button onClick={onClose} style={{background:'none',border:'none'}}><X size={18}/></button></div><Field label="Question type"><select className={inputStyle} value={form.type} onChange={event=>set('type',event.target.value)}>{ASSESSMENT_TYPES.map(type=><option key={type} value={type}>{type}</option>)}</select></Field><Field label="Question text"><textarea className={inputStyle+' resize-y'} rows={3} value={form.text||''} onChange={event=>set('text',event.target.value)}/></Field><Field label="Image URL"><input type="url" className={inputStyle} value={form.imageUrl||''} onChange={event=>set('imageUrl',event.target.value)} placeholder="Paste a public image or Google Drive link"/><div style={{fontSize:11.5,color:'#8A96A3',marginTop:4}}>Drive files must be shared as Anyone with the link, Viewer.</div>{form.imageUrl&&<img src={normalizeImageUrl(form.imageUrl)} alt="Question preview" style={{display:'block',maxWidth:'100%',maxHeight:180,objectFit:'contain',marginTop:8,border:'1px solid #DDE2E6'}} onError={event=>{event.currentTarget.alt='Image could not be loaded';}}/>}</Field>{form.type==='paragraph'?<><Field label="Rubric"><textarea className={inputStyle+' resize-y'} rows={3} value={form.rubric||''} onChange={event=>set('rubric',event.target.value)} placeholder="What should staff look for when reviewing?"/></Field><Field label="Expected concepts"><input className={inputStyle} value={(form.expectedConcepts||[]).join(', ')} onChange={event=>set('expectedConcepts',event.target.value.split(',').map(item=>item.trim()).filter(Boolean))} placeholder="Concept 1, Concept 2"/></Field></>:<Field label="Options and correct answers"><div style={{fontSize:11.5,color:'#8A96A3',marginBottom:6}}>Select the radio button or checkbox beside every correct option.</div><div style={{display:'flex',flexDirection:'column',gap:7}}>{form.options.map((option,index)=><div key={option.id} style={{display:'flex',gap:7,alignItems:'center'}}><input type={form.type==='single'?'radio':'checkbox'} name={`correct-${question.id}`} checked={form.correct.includes(option.id)} onChange={()=>toggleCorrect(option.id)} aria-label={`Mark option ${index+1} correct`}/><input className={inputStyle+' flex-1'} value={option.text} onChange={event=>updateOption(option.id,'text',event.target.value)} placeholder={`Option ${index+1}`}/>{form.options.length>2&&<button onClick={()=>removeOption(option.id)} style={{...linkBtn,color:'#B84C4C'}}>Remove</button>}</div>)}</div><button onClick={()=>set('options',[...form.options,{id:`option-${question.id}-${Date.now()}`,text:''}])} className={btnGhost+' px-[5px] py-0'}>+ Add option</button></Field>}{groups?.length>0&&<Field label="Optional question targets"><select multiple className={inputStyle+' min-h-[64px]'} value={form.targetGroupIds} onChange={event=>set('targetGroupIds',Array.from(event.target.selectedOptions,option=>option.value))}>{groups.map((group,index)=><option key={group.id} value={group.id}>Group {index+1} {group.track||'all tracks'} {group.afaGroup||''}</option>)}</select><div style={{fontSize:11.5,color:'#8A96A3',marginTop:4}}>Leave empty to assign this question to every assigned Fellow.</div></Field>}<div style={{display:'flex',gap:10}}><Field label="Points" style={{flex:1}}><input type="number" min="1" className={inputStyle} value={form.points||1} onChange={event=>set('points',Number(event.target.value))}/></Field><Field label="Time limit (minutes)" style={{flex:1}}><input type="number" min="0" className={inputStyle} value={form.timeLimit||0} onChange={event=>set('timeLimit',Number(event.target.value))}/></Field></div><button onClick={save} className={btnPrimary+' w-full justify-center'}>Save question</button></div></div>;
}

function LegacyOwnedQuestionEditor({ question, groups, onSave, onClose }){
  const [form,setForm]=useState({...question,options:[...(question.options||[''])],correct:[...(question.correct||[])],targetGroupIds:[...(question.targetGroupIds||[])]});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const updateOption=(index,value)=>set('options',form.options.map((option,itemIndex)=>itemIndex===index?value:option));
  const toggleCorrect=option=>set('correct',form.correct.includes(option)?form.correct.filter(item=>item!==option):form.type==='single'?[option]:[...form.correct,option]);
  const save=()=>{const options=form.options.map(option=>option.trim()).filter(Boolean);if(!form.text.trim()||options.length<2||!form.correct.length){window.alert('Add question text, at least two options, and select the correct answer.');return;}onSave({...form,options,correct:form.correct.filter(option=>options.includes(option)),updatedAt:new Date().toISOString()});};
  return <div style={{position:'fixed',inset:0,background:'rgba(27,39,51,.4)',display:'flex',justifyContent:'flex-end',zIndex:130}} onClick={onClose}><div onClick={event=>event.stopPropagation()} style={{width:460,maxWidth:'94vw',background:'#fff',height:'100%',overflowY:'auto',padding:22}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><b>Question editor</b><button onClick={onClose} style={{background:'none',border:'none'}}><X size={18}/></button></div><Field label="Question type"><select className={inputStyle} value={form.type} onChange={event=>set('type',event.target.value)}>{ASSESSMENT_TYPES.map(type=><option key={type} value={type}>{type}</option>)}</select></Field><Field label="Question text"><textarea className={inputStyle+' resize-y'} rows={3} value={form.text} onChange={event=>set('text',event.target.value)}/></Field><Field label="Options"><div style={{display:'flex',flexDirection:'column',gap:6}}>{form.options.map((option,index)=><div key={index} style={{display:'flex',gap:6,alignItems:'center'}}><input type={form.type==='single'?'radio':'checkbox'} checked={form.correct.includes(option)&&Boolean(option)} onChange={()=>toggleCorrect(option)} title="Correct answer"/><input className={inputStyle} value={option} onChange={event=>updateOption(index,event.target.value)} placeholder={`Option ${index+1}`}/>{form.options.length>2&&<button onClick={()=>{const next=form.options.filter((_,itemIndex)=>itemIndex!==index);set('options',next);set('correct',form.correct.filter(item=>next.includes(item)));}} style={{...linkBtn,color:'#B84C4C'}}>Remove</button>}</div>)}</div><button onClick={()=>set('options',[...form.options,''])} className={btnGhost+' px-[5px] py-0'}>+ Add option</button></Field><div style={{display:'flex',gap:10}}><Field label="Points" style={{flex:1}}><input type="number" min="1" className={inputStyle} value={form.points} onChange={event=>set('points',Number(event.target.value))}/></Field><Field label="Time limit (minutes)" style={{flex:1}}><input type="number" min="0" className={inputStyle} value={form.timeLimit||0} onChange={event=>set('timeLimit',Number(event.target.value))}/></Field></div><button onClick={save} className={btnPrimary+' w-full justify-center'}>Save question</button></div></div>;
}

function AssessmentsPanel({ assessments, questions, sessions, roster, onAssessmentsChange, onQuestionsChange, showToast }){
  const [editing, setEditing] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const saveAssessment = assessment => {
    onAssessmentsChange(assessments.some(item=>item.id===assessment.id) ? assessments.map(item=>item.id===assessment.id?assessment:item) : [...assessments,assessment]);
    setEditing(null); showToast('Assessment saved');
  };
  const saveQuestion = question => {
    onQuestionsChange(questions.some(item=>item.id===question.id) ? questions.map(item=>item.id===question.id?question:item) : [...questions,question]);
    setEditingQuestion(null); showToast('Question saved');
  };
  const removeAssessment = id => { onAssessmentsChange(assessments.filter(item=>item.id!==id)); showToast('Assessment removed'); };
  const removeQuestion = id => { onQuestionsChange(questions.filter(item=>item.id!==id)); showToast('Question removed'); };
  return <div>
    <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}><button onClick={()=>setEditing(newAssessment(sessions))} className={btnPrimary}><Plus size={14}/> Create assessment</button><button onClick={()=>setEditingQuestion(newQuestion())} className={btnSecondary}><Plus size={14}/> Add question</button></div>
    <div style={{fontSize:13,color:'#5B6672',marginBottom:18}}>Assessments are linked to one session. Use Primary or Secondary assignment groups and set a Bangladesh-time response window.</div>
    {assessments.map(assessment=><div key={assessment.id} style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:14,maxWidth:760,marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{fontWeight:700}}>{assessment.title}</div><div style={{fontSize:12,color:'#5B6672',marginTop:4}}>{sessions.find(session=>String(session.id)===String(assessment.sessionId))?.name || 'Session not found'} · {assessment.status} · {assessment.startsAt || 'No start'} to {assessment.endsAt || 'No end'}</div><div style={{fontSize:12,color:'#5B6672',marginTop:4}}>{(assessment.questionIds||[]).length} questions · {(assessment.assignmentGroups||[]).length} assignment groups</div></div><div style={{display:'flex',gap:10}}><button onClick={()=>setEditing(assessment)} style={linkBtn}>Edit</button><button onClick={()=>removeAssessment(assessment.id)} style={{...linkBtn,color:'#B84C4C'}}>Delete</button></div></div></div>)}
    {assessments.length===0 && <div style={{padding:'30px 0',color:'#8A96A3'}}>No assessments created yet.</div>}
    <div style={{marginTop:28,fontWeight:700,marginBottom:10}}>Question bank</div>
    {questions.map(question=><div key={question.id} style={{background:'#fff',border:'1px solid #DDE2E6',borderRadius:8,padding:12,maxWidth:760,marginBottom:8,display:'flex',justifyContent:'space-between',gap:12}}><div><b>{question.text || 'Untitled question'}</b><div style={{fontSize:12,color:'#5B6672',marginTop:4}}>{question.type} · {question.points} points{question.imageUrl?' · image':''}</div></div><div style={{display:'flex',gap:10}}><button onClick={()=>setEditingQuestion(question)} style={linkBtn}>Edit</button><button onClick={()=>removeQuestion(question.id)} style={{...linkBtn,color:'#B84C4C'}}>Delete</button></div></div>)}
    {editing && <AssessmentEditor assessment={editing} sessions={sessions} roster={roster} questions={questions} onSave={saveAssessment} onClose={()=>setEditing(null)} />}
    {editingQuestion && <QuestionEditor question={editingQuestion} onSave={saveQuestion} onClose={()=>setEditingQuestion(null)} />}
  </div>;
}

function newAssessment(sessions){
  const session = sessions.find(item=>item.date) || sessions[0];
  return {id:'assessment'+Date.now(),sessionId:session?.id||'',title:'',description:'',status:'draft',startsAt:'',endsAt:'',durationMinutes:30,questionIds:[],questions:[],assignmentGroups:[{id:'group'+Date.now(),track:'',fellowIds:[],questionIds:[]}],createdAt:new Date().toISOString()};
}

function newQuestion(){ return {id:'question'+Date.now(),type:'single',text:'',options:[''],gridRows:[''],gridCols:[''],correct:[],points:1,timeLimit:0,imageUrl:''}; }

function AssessmentEditor({ assessment, sessions, roster, questions, onSave, onClose }){
  const [form,setForm]=useState({...assessment,assignmentGroups:(assessment.assignmentGroups||[]).map(group=>({...group,fellowIds:[...(group.fellowIds||[])],questionIds:[...(group.questionIds||[])]}))});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const addGroup=()=>set('assignmentGroups',[...(form.assignmentGroups||[]),{id:'group'+Date.now(),track:'secondary',fellowIds:[],questionIds:[]}]);
  const updateGroup=(id,key,value)=>set('assignmentGroups',form.assignmentGroups.map(group=>group.id===id?{...group,[key]:value}:group));
  return <div style={{position:'fixed',inset:0,background:'rgba(27,39,51,.4)',display:'flex',justifyContent:'flex-end',zIndex:120}} onClick={onClose}><div onClick={event=>event.stopPropagation()} style={{width:460,maxWidth:'94vw',background:'#fff',height:'100%',overflowY:'auto',padding:22}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><b>{assessment.title?'Edit assessment':'Create assessment'}</b><button onClick={onClose} style={{background:'none',border:'none'}}><X size={18}/></button></div><Field label="Title"><input className={inputStyle} value={form.title} onChange={event=>set('title',event.target.value)} placeholder="Exit ticket title"/></Field><Field label="Session"><select className={inputStyle} value={form.sessionId} onChange={event=>set('sessionId',event.target.value)}>{sessions.map(session=><option key={session.id} value={session.id}>{session.name}</option>)}</select></Field><Field label="Description"><textarea className={inputStyle+' resize-y'} rows={3} value={form.description} onChange={event=>set('description',event.target.value)}/></Field><div style={{display:'flex',gap:10}}><Field label="Starts (Bangladesh time)" style={{flex:1}}><input type="datetime-local" className={inputStyle} value={form.startsAt} onChange={event=>set('startsAt',event.target.value)}/></Field><Field label="Ends (Bangladesh time)" style={{flex:1}}><input type="datetime-local" className={inputStyle} value={form.endsAt} onChange={event=>set('endsAt',event.target.value)}/></Field></div><Field label="Status"><select className={inputStyle} value={form.status} onChange={event=>set('status',event.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select></Field><Field label="Questions"><select multiple className={inputStyle+' min-h-[100px]'} value={form.questionIds} onChange={event=>set('questionIds',Array.from(event.target.selectedOptions,option=>option.value))}>{questions.map(question=><option key={question.id} value={question.id}>{question.text||'Untitled question'}</option>)}</select></Field><Field label="Assignment groups"><div style={{display:'flex',flexDirection:'column',gap:10}}>{(form.assignmentGroups||[]).map(group=><div key={group.id} style={{border:'1px solid #DDE2E6',padding:10,borderRadius:6}}><select className={inputStyle} value={group.track} onChange={event=>updateGroup(group.id,'track',event.target.value)}><option value="primary">Primary Fellows</option><option value="secondary">Secondary Fellows</option></select><select multiple className={inputStyle+' min-h-[70px] mt-[8px]'} value={group.fellowIds} onChange={event=>updateGroup(group.id,'fellowIds',Array.from(event.target.selectedOptions,option=>option.value))}>{roster.map(fellow=><option key={fellow.id} value={fellow.id}>{fellow.name} · {fellow.afaGroup||'No AFA group'}</option>)}</select></div>)}</div><button onClick={addGroup} className={btnGhost+' mt-[8px]'}>+ Add assignment group</button></Field><div style={{display:'flex',gap:8,marginTop:18}}><button onClick={()=>onSave({...form,updatedAt:new Date().toISOString()})} className={btnPrimary+' flex-1 justify-center'}>Save assessment</button><button onClick={onClose} className={btnGhost}>Cancel</button></div></div></div>;
}

function QuestionEditor({ question, onSave, onClose }){
  const [form,setForm]=useState({...question,options:[...(question.options||[''])],gridRows:[...(question.gridRows||[''])],gridCols:[...(question.gridCols||[''])],correct:[...(question.correct||[])]});
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const updateList=(key,index,value)=>set(key,form[key].map((item,itemIndex)=>itemIndex===index?value:item));
  const listEditor=(key,label)=><Field label={label}><div style={{display:'flex',flexDirection:'column',gap:6}}>{form[key].map((item,index)=><div key={index} style={{display:'flex',gap:6}}><input className={inputStyle} value={item} onChange={event=>updateList(key,index,event.target.value)}/>{form[key].length>1&&<button onClick={()=>set(key,form[key].filter((_,itemIndex)=>itemIndex!==index))} style={{...linkBtn,color:'#B84C4C'}}>Remove</button>}</div>)}<button onClick={()=>set(key,[...form[key],''])} className={btnGhost+' px-1 py-0'}>+ Add</button></div></Field>;
  return <div style={{position:'fixed',inset:0,background:'rgba(27,39,51,.4)',display:'flex',justifyContent:'flex-end',zIndex:130}} onClick={onClose}><div onClick={event=>event.stopPropagation()} style={{width:460,maxWidth:'94vw',background:'#fff',height:'100%',overflowY:'auto',padding:22}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><b>Question editor</b><button onClick={onClose} style={{background:'none',border:'none'}}><X size={18}/></button></div><Field label="Question type"><select className={inputStyle} value={form.type} onChange={event=>set('type',event.target.value)}>{ASSESSMENT_TYPES.map(type=><option key={type} value={type}>{type}</option>)}</select></Field><Field label="Question text"><textarea className={inputStyle+' resize-y'} rows={4} value={form.text} onChange={event=>set('text',event.target.value)}/></Field>{['single','multiple','check'].includes(form.type)&&listEditor('options','Options')}{['mcq_grid','checkbox_grid'].includes(form.type)&&<>{listEditor('gridRows','Grid rows')}{listEditor('gridCols','Grid columns')}</>}<Field label="Correct answer JSON"><input className={inputStyle} value={Array.isArray(form.correct)?JSON.stringify(form.correct):form.correct} onChange={event=>set('correct',event.target.value)}/></Field><div style={{display:'flex',gap:10}}><Field label="Points" style={{flex:1}}><input type="number" min="0" className={inputStyle} value={form.points} onChange={event=>set('points',Number(event.target.value))}/></Field><Field label="Time limit (minutes)" style={{flex:1}}><input type="number" min="0" className={inputStyle} value={form.timeLimit} onChange={event=>set('timeLimit',Number(event.target.value))}/></Field></div><Field label="Image URL (JPG, JPEG, or PNG)"><input type="url" className={inputStyle} value={form.imageUrl} onChange={event=>set('imageUrl',event.target.value)} placeholder="https://..."/></Field><button onClick={()=>onSave({...form,updatedAt:new Date().toISOString()})} className={btnPrimary+' w-full justify-center mt-[10px]'}>Save question</button></div></div>;
}

function EditPanel({ session, onSave, onDelete, onClose, canEditSchedule, pillars, rooms, staff, weeks, startDate }){
  const [form, setForm] = useState({ ...session, facilitators: (session.facilitators||[]).map(f => typeof f==='string' ? {id:newResId(), staffName:f, roomId:''} : {id:f.id||newResId(), staffName:f.staffName||f.name||'', roomId:f.roomId||'', group:f.group||''}), resources: session.resources ? session.resources.map(r=>({...r})) : [], outcomes: (session.outcomes||[]).filter(Boolean).map(text=>({id:newResId(), text})), notes:session.notes||'', fellowNotes:session.fellowNotes||'', attendanceCode:session.attendanceCode||'' });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const addResource = () => set('resources', [...form.resources, {id:newResId(), label:RESOURCE_KINDS[0], url:''}]);
  const updateResource = (id, key, val) => set('resources', form.resources.map(r => r.id===id ? {...r,[key]:val} : r));
  const removeResource = (id) => set('resources', form.resources.filter(r=>r.id!==id));
  const addOutcome = () => set('outcomes', [...form.outcomes, {id:newResId(), text:''}]);
  const updateOutcome = (id, val) => set('outcomes', form.outcomes.map(o => o.id===id ? {...o, text:val} : o));
  const removeOutcome = (id) => set('outcomes', form.outcomes.filter(o=>o.id!==id));
  const addFacilitator = () => set('facilitators', [...form.facilitators, {id:newResId(), staffName:'', roomId:''}]);
  const updateFacilitator = (id, key, val) => set('facilitators', form.facilitators.map(f => f.id===id ? {...f,[key]:val} : f));
  const removeFacilitator = (id) => set('facilitators', form.facilitators.filter(f=>f.id!==id));

  const handleSave = () => {
    const weekday = form.date ? new Date(form.date+'T00:00:00').toLocaleDateString(undefined,{weekday:'long'}) : '';
    const derivedWeek = form.date && startDate ? weekForDate(form.date, startDate) : null;
    onSave({
      id: form.id, week: derivedWeek!=null ? derivedWeek : (form.date ? form.week : (form.week===''? null : Number(form.week))),
      date: form.date || null, weekday: form.date ? weekday : null, start: form.start || null, end: form.end || null,
      name: form.name, pillar: form.pillar, mode: form.mode,
      facilitators: form.facilitators.map(f=>{ const rec={id:f.id||newResId(), staffName:(f.staffName||'').trim(), roomId:(f.roomId||'').trim()}; if(f.group) rec.group=f.group; return rec; }).filter(f=>f.staffName || f.roomId || f.group),
      roomIds: form.roomIds || [],
      resources: form.resources.filter(r=>r.url.trim()),
      outcomes: form.outcomes.map(o=>(o.text||'').trim()).filter(Boolean),
      notes: form.notes.trim(), fellowNotes: form.fellowNotes.trim(), afaGroup:form.afaGroup.trim(), attendanceCode:form.attendanceCode.trim(),
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
        <Field label="Session name"><input disabled={!canEditSchedule} className={inputStyle+(canEditSchedule?'':' opacity-60')} value={form.name} onChange={e=>set('name', e.target.value)} placeholder="e.g. Backward Planning Workshop" /></Field>
        <div style={{display:'flex', gap:10, opacity:canEditSchedule?1:0.6}}>
          <Field label="Date" style={{flex:1}}><input disabled={!canEditSchedule} type="date" className={inputStyle} value={form.date||''} onChange={e=>set('date', e.target.value)} /></Field>
          <Field label="Week" style={{width:110}}><select disabled={!canEditSchedule} className={inputStyle} value={form.week??''} onChange={e=>set('week', e.target.value)}><option value="">—</option>{(weeks||WEEKS).map(w => <option key={w} value={w}>Week {String(w).padStart(2,'0')}</option>)}</select></Field>
        </div>
        <div style={{display:'flex', gap:10, opacity:canEditSchedule?1:0.6}}>
          <Field label="Start time" style={{flex:1}}><input disabled={!canEditSchedule} type="time" className={inputStyle} value={form.start||''} onChange={e=>set('start', e.target.value)} /></Field>
          <Field label="End time" style={{flex:1}}><input disabled={!canEditSchedule} type="time" className={inputStyle} value={form.end||''} onChange={e=>set('end', e.target.value)} /></Field>
        </div>
        <Field label="Pillar"><select disabled={!canEditSchedule} className={inputStyle} value={form.pillar} onChange={e=>set('pillar', e.target.value)}>{(pillars||DEFAULT_PILLARS).map(p => <option key={p.id||p.name} value={p.name}>{p.name}</option>)}</select></Field>
        <Field label="Work mode (for time tracking)"><select disabled={!canEditSchedule} className={inputStyle} value={form.mode} onChange={e=>set('mode', e.target.value)}>{MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
        <Field label="Facilitators">
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {form.facilitators.map(f => (
              <div key={f.id} style={{display:'flex', gap:6, alignItems:'center', flexWrap:'wrap', border:'1px solid #E5E9EC', borderRadius:6, padding:8}}>
                {(staff||[]).length>0 ? (
                  <select disabled={!canEditSchedule} className={inputStyle+' w-auto flex-1 min-w-[130px]'} value={f.staffName||''} onChange={e=>updateFacilitator(f.id,'staffName',e.target.value)}>
                    <option value="">Facilitator name…</option>
                    {staff.map(p=><option key={p.id||p.email||p.name} value={p.name}>{p.name}{p.role && AFA_ROLES.includes(p.role) && p.group ? ' — '+p.group : ''}</option>)}
                  </select>
                ) : (
                  <input disabled={!canEditSchedule} className={inputStyle+' w-auto flex-1 min-w-[130px]'} placeholder="Facilitator name" value={f.staffName||''} onChange={e=>updateFacilitator(f.id,'staffName',e.target.value)} />
                )}
                <select disabled={!canEditSchedule} className={inputStyle+' w-auto flex-1 min-w-[120px]'} value={f.roomId||''} onChange={e=>updateFacilitator(f.id,'roomId',e.target.value)}>
                  <option value="">Session room…</option>
                  {(rooms||[]).map(room=><option key={room.id} value={room.id}>{room.name}</option>)}
                </select>
                <button onClick={()=>removeFacilitator(f.id)} style={{background:'none', border:'none', color:'#B84C4C', cursor:'pointer', flexShrink:0}}><X size={15}/></button>
              </div>
            ))}
          </div>
          <button disabled={!canEditSchedule} onClick={addFacilitator} className={btnGhost+' mt-2 px-1 py-1.5'}><Plus size={13}/> Add facilitator</button>
          <div style={{fontSize:11, color:'#8A96A3', marginTop:6}}>Session rooms and AFA rooms are managed in the Rooms tab.</div>
        </Field>
        <Field label="Attendance code"><input disabled={!canEditSchedule} className={inputStyle+(canEditSchedule?'':' opacity-60')} value={form.attendanceCode||''} onChange={e=>set('attendanceCode',e.target.value)} placeholder="Code Fellows enter for attendance" /></Field>
        <Field label="Planner notes (internal)"><textarea className={inputStyle+' resize-y'} rows={3} value={form.notes} onChange={e=>set('notes', e.target.value)} placeholder="Internal planning notes" /></Field>
        <Field label="Fellow-visible notes"><textarea className={inputStyle+' resize-y'} rows={3} value={form.fellowNotes} onChange={e=>set('fellowNotes', e.target.value)} placeholder="Notes Fellows should see" /></Field>
        <Field label="Resources">
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {form.resources.map(r => (
              <div key={r.id} style={{display:'flex', gap:6, alignItems:'center'}}>
                <select className={inputStyle+' w-[120px]! shrink-0'} value={r.label} onChange={e=>updateResource(r.id,'label',e.target.value)}>{RESOURCE_KINDS.map(k => <option key={k} value={k}>{k}</option>)}</select>
                <input className={inputStyle} placeholder="https://…" value={r.url} onChange={e=>updateResource(r.id,'url',e.target.value)} />
                <button onClick={()=>removeResource(r.id)} style={{background:'none', border:'none', color:'#B84C4C', cursor:'pointer', flexShrink:0}}><X size={15}/></button>
              </div>
            ))}
          </div>
          <button onClick={addResource} className={btnGhost+' mt-2 px-1 py-1.5'}><Plus size={13}/> Add resource link</button>
        </Field>
        <Field label="Outcomes">
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {form.outcomes.map(o => (
              <div key={o.id} style={{display:'flex', gap:6, alignItems:'center'}}>
                <input className={inputStyle} placeholder="Outcome" value={o.text} onChange={e=>updateOutcome(o.id,e.target.value)} />
                <button onClick={()=>removeOutcome(o.id)} style={{background:'none', border:'none', color:'#B84C4C', cursor:'pointer', flexShrink:0}}><X size={15}/></button>
              </div>
            ))}
          </div>
          <button onClick={addOutcome} className={btnGhost+' mt-2 px-1 py-1.5'}><Plus size={13}/> Add outcome</button>
        </Field>
        <div style={{display:'flex', gap:8, marginTop:20}}>
          <button onClick={handleSave} className={btnPrimary+' flex-1 justify-center py-2.5'}>Save session</button>
          {onDelete && <button onClick={()=>{ if(window.confirm('Delete this session?')) onDelete(session.id); }} className={btnSecondary+' text-[#B84C4C] border-[#E3B8B8]'}>Delete</button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, style }){
  return (<div style={{marginBottom:14, ...style}}><div style={{fontSize:12, color:'#5b6672', fontWeight:600, marginBottom:5}}>{label}</div>{children}</div>);
}
const inputStyle = 'w-full px-2.5 py-2 rounded-md border border-[#C9CDD2] text-[13px] bg-white box-border';

// Test hook: lets tooling render every panel in isolation (harmless in the app bundle)
export const __panels = { CalendarView, PlacementPanel, SessionsTable, AssignmentPanel, RoomsPanel, PillarsPanel, TimeSummary, ExpandedAnalyticsPanel, ParagraphReviewPanel, ViewPanel, RosterPanel, PlannerPanel, RequestsPanel, LocalAssessmentsPanel, EditPanel, Sidebar, TopBar, FilterBar, SessionAssessmentBreakdown, computeAttemptScore, computeAttemptPercentage, weekForDate };
