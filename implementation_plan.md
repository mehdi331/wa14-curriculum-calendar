# Implementation Plan

## Overview

Add a **Fellows Resources** system to the City fellowship calendar that lets staff attach grade/subject-specific and custom-tagged learning materials (books, texts, articles, links, videos) to City items, and view them from a Fellows-facing Resources home tab. Simultaneously overhaul the City UI with a cleaner, more user-friendly layout: consistent card-based components, proper spacing hierarchy, a navigable sidebar, and reusable field wrappers replacing the current inline-style spaghetti.

This plan is divided into four phases: data model + storage, admin editor, Fellows facing UI, and cosmetics/UI cleanup.

## Types

### 1. Resource type definition (src/city/cityResources.js)

`js
// Resource kind
const RESOURCE_KINDS = [
  { id: 'book',      label: 'Book' },
  { id: 'text',      label: 'Text/Reading' },
  { id: 'article',   label: 'Article' },
  { id: 'link',      label: 'Link' },
  { id: 'video',     label: 'Video' },
  { id: 'puzzle',    label: 'Puzzle/Game' },
  { id: 'tool',      label: 'Tool/Platform' },
];

`
