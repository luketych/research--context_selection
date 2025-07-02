---
Created: 2025-07-02 14:30:00 PST
Updated: 2025-07-02 02:01:15 PM PDT
---

# High Level Project Idea

A basic app using the following technologies:

gitmcp
quartz

This app demonstrates the ability to create a new repo with a descriptions folder, containing .md files. These files will serve as a large part of the context of the project.
The descriptions folder will be pushed to a unique git repo.
The git repo will also serve as a mcp server, allowing certain files and folders to be hidden or exposed to the public, so that anyone using the mcp server will only see the files and folders that are exposed.
On the frontend, the descriptions will all be viewable via quartz, which renders them from .md to html. Every file and folder will have a checkbox to toggle it's visibility on the mcp server.
When checking the box, the file or folder will be added to the mcp server, and when unchecked, it will be removed.

This flow allows a programmer decide which parts of the overal context should be available to any LLM's accessing the context via mcp.
