\# DealsWindfall – Safe Git Workflow (2 PCs)



This project uses the following promotion flow:



feature-ui-improvements → dev → staging → main



DO NOT commit directly to `main`.



---



\## 🧠 General Rules (Read First)



1\. Always pull before starting work

2\. Never work directly on `main`

3\. All fixes go into `feature-ui-improvements`

4\. Promote changes step-by-step

5\. If unsure — STOP and check `git status`



---



\## 🟢 START WORK (on any PC)



```bash

git checkout feature-ui-improvements

git pull origin feature-ui-improvements



