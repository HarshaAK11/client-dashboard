# Manual Testing Guide: Role-Based Dashboard

This guide outlines how to manually verify the role-based access control (RBAC) implementation using the Development Mode Role Switcher.

## Prerequisites
1. Ensure `NEXT_PUBLIC_DEV_MODE=true` is set in `.env.local`.
2. Run the development server: `npm run dev`.
3. Open the dashboard in your browser (usually `http://localhost:3000`).
4. **Note:** In Dev Mode, clicking a role in the sidebar will automatically create a mock user session if you are not logged in.

---

## Test Case 1: Admin Role Verification

**Goal:** Verify that Admins have full visibility and control.

1. **Switch Role:** Click **"Admin"** in the sidebar role switcher.
2. **Verify Dashboard:**
   - [ ] **Global Metrics:** Confirm you see "Total Event Volume", "AI Automation Rate", etc.
   - [ ] **Volume Trends:** Confirm you see the area chart showing volume over time.
   - [ ] **Automation Rate:** Confirm you see the pie chart.
3. **Verify Escalations:**
   - [ ] Navigate to **Escalations** view.
   - [ ] Confirm you see escalations from **ALL** departments.
4. **Verify Actions:**
   - [ ] Select an event.
   - [ ] Confirm you see **"Assign"**, **"Reassign"**, and **"Delete"** buttons (if implemented in UI).
   - [ ] Confirm you can see the **"Settings"** page with tenant-wide configurations.

---

## Test Case 2: Manager Role Verification

**Goal:** Verify that Managers are scoped to their department.

1. **Switch Role:** Click **"Manager"** in the sidebar role switcher.
2. **Verify Dashboard:**
   - [ ] **Department Metrics:** Confirm you see "Active Escalations", "Avg. SLA Compliance" for your department.
   - [ ] **Team Workload:** Confirm you see the bar chart showing agent workload.
   - [ ] **Escalation Queue:** Confirm you see a table of escalations.
   - [ ] **Absence:** Confirm you **DO NOT** see "Events" or "Settings" in the sidebar.
3. **Verify Escalations:**
   - [ ] Navigate to **Escalations** view.
   - [ ] Confirm you only see escalations relevant to your department.
4. **Verify Team:**
   - [ ] Navigate to **Team** view.
   - [ ] Confirm you see only members of your department.
   - [ ] Confirm you **DO NOT** see the "Invite Member" button.
5. **Verify Analytics:**
   - [ ] Navigate to **Analytics** view.
   - [ ] Confirm "Department Performance" table shows only your department (e.g., 'Customer Support').

---

## Test Case 3: Agent Role Verification

**Goal:** Verify that Agents are restricted to their assigned work.

1. **Switch Role:** Click **"Agent"** in the sidebar role switcher.
2. **Verify Dashboard:**
   - [ ] **Personal Queue:** Confirm you see a list of "Assigned Events" or "My Queue".
   - [ ] **Absence:** Confirm you **DO NOT** see any charts (Workload, Volume, etc.).
   - [ ] **Absence:** Confirm you **DO NOT** see the "Escalation Queue" table.
3. **Verify Escalations:**
   - [ ] Navigate to **Escalations** view.
   - [ ] Confirm you see **"Access Denied"** or an empty list (depending on UI implementation for 403).
4. **Verify Actions:**
   - [ ] Confirm you see **"Reply"** and **"Resolve"** buttons on your events.
   - [ ] Confirm you **CANNOT** assign or reassign events.

---

## Test Case 4: API Security (Optional / Advanced)

**Goal:** Verify that the API enforces permissions even if UI is bypassed.

1. **Tool:** Use `curl` or Postman.
2. **Test:** Try to hit `/api/escalations` without a token (in Dev Mode, it returns data).
3. **Test:** In Production Mode (`NEXT_PUBLIC_DEV_MODE=false`), confirm it returns `401 Unauthorized`.

---

## Troubleshooting

- **Role Switcher Not Visible?** Check `.env.local` and restart server.
- **Data Not Loading?** Check console for API errors. In Dev Mode, auth failures are warnings, not errors.
- **Wrong Data?** Ensure your mock data or database data has `department_id` and `assigned_user_id` set correctly to match the test scenarios.
