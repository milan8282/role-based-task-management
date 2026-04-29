import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleRoute from "../components/common/RoleRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import MyTasks from "../pages/MyTasks";
import AllTasks from "../pages/AllTasks";
import Users from "../pages/Users";
import Notifications from "../pages/Notifications";
import Categories from "../pages/Categories";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="my-tasks" element={<MyTasks />} />

        <Route
          path="all-tasks"
          element={
            <RoleRoute role="admin">
              <AllTasks />
            </RoleRoute>
          }
        />

        <Route
          path="categories"
          element={
            <RoleRoute role="admin">
              <Categories />
            </RoleRoute>
          }
        />

        <Route
          path="users"
          element={
            <RoleRoute role="admin">
              <Users />
            </RoleRoute>
          }
        />

        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}