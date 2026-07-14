# Notification System + Navbar Update

## Files

### NEW
- `src/components/Notifications/NotificationBell.jsx`
- `src/components/Notifications/NotificationBell.module.css`
- `src/pages/Notifications.jsx`
- `src/pages/Notifications.module.css`
- `src/data/notificationsMock.js`

### UPDATED (replace existing)
- `src/components/CustomerNavbar.jsx`
- `src/components/VendorNavbar.jsx`
- `src/styles/CustomerNavbar.module.css`
- `src/styles/VendorNavbar.module.css`

## Wiring

1. Add the route (any router file):
```jsx
import Notifications from "@/pages/Notifications";
<Route path="/notifications" element={<Notifications />} />
```

2. The bell appears automatically in both navbars (right side).

3. `MobileDrawer` receives a new optional prop `notificationsHref="/notifications"`.
   Inside your existing drawer, render a link when present:
```jsx
{notificationsHref && (
  <NavLink to={notificationsHref} onClick={onClose}>
    Notifications
  </NavLink>
)}
```

## Replace mock with backend
In `src/data/notificationsMock.js`, swap `mockNotifications` with a fetch
inside `NotificationBell.jsx` / `Notifications.jsx`. Keep the same shape:

```js
{ id, title, message, type, isRead, createdAt, link }
```

`type` ∈ `lead | response | reminder | fallback | feedback`.

## Responsive breakpoints (fixed)
- Desktop:  > 1024px → full nav
- Tablet:   768–1024 → trimmed links, tighter spacing
- Mobile:   < 768px  → hamburger + bell only
