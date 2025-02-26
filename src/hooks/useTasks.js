import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { authService } from "../firebase/auth";

export const useTasks = (projectId, viewType = null, selectedUserId) => {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const currentUser = authService.getCurrentUser();

  // Fetch project and user details
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        // Handle project data
        if (projectId === 0 || projectId === "0") {
          setProject({ title: "All Tasks", id: 0 });
        } else if (projectId) {
          // Fetch specific project
          const projectsRef = collection(db, "projects");
          const q = query(projectsRef);
          const querySnapshot = await getDocs(q);

          let foundProject = null;
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.id && data.id.toString() === projectId.toString()) {
              foundProject = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
              };
            }
          });

          if (foundProject && isMounted) {
            setProject(foundProject);
          } else if (isMounted) {
            console.error("No project found with ID:", projectId);
            setError("Project not found");
          }
        }

        // Handle user data
        if (selectedUserId === 0 || selectedUserId === "0") {
          setUserDetails({ id: 0, name: "All" });
        } else if (selectedUserId) {
          // Fetch specific user details
          const userDoc = await getDoc(doc(db, "users", selectedUserId));
          if (userDoc.exists() && isMounted) {
            const userData = userDoc.data();
            setUserDetails({
              id: userDoc.id,
              ...userData,
              initials: userData.initials || userData.name?.charAt(0) || "U",
              avatarColor: userData.avatarColor || "blue",
            });
          } else if (isMounted) {
            console.error("No user found with ID:", selectedUserId);
            setError("User not found");
          }
        } else {
          setUserDetails(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) setError(err.message);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [projectId, selectedUserId]);

  // Fetch tasks
  useEffect(() => {
    // Don't run if we don't have project data yet
    if (!projectId && projectId !== 0 && projectId !== "0") {
      setLoading(false);
      return;
    }

    // For non-my-tasks view with specific user, wait for user details
    if (viewType !== "my-tasks" && selectedUserId && 
        selectedUserId !== 0 && selectedUserId !== "0" && 
        !userDetails) {
      return;
    }

    const tasksRef = collection(db, "tasks");
    let q;

    // Determine the appropriate query based on filters
    const isAllProjects = projectId === 0 || projectId === "0";
    const isAllUsers = !selectedUserId || selectedUserId === 0 || selectedUserId === "0";

    if (viewType === "my-tasks") {
      if (isAllProjects) {
        q = query(
          tasksRef,
          where("assignees", "array-contains", currentUser?.uid)
        );
      } else {
        q = query(
          tasksRef,
          where("projectId", "==", projectId),
          where("assignees", "array-contains", currentUser?.uid)
        );
      }
    } else {
      if (!isAllProjects && !isAllUsers) {
        q = query(
          tasksRef,
          where("projectId", "==", projectId),
          where("assignees", "array-contains", selectedUserId)
        );
      } else if (isAllProjects && !isAllUsers) {
        q = query(
          tasksRef,
          where("assignees", "array-contains", selectedUserId)
        );
      } else if (!isAllProjects && isAllUsers) {
        q = query(tasksRef, where("projectId", "==", projectId));
      } else {
        q = query(tasksRef);
      }
    }

    // Subscribe to tasks
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksByStatus = {
          todo: [],
          inProgress: [],
          done: [],
        };

        snapshot.docs.forEach((doc) => {
          const task = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          };

          if (tasksByStatus[task.status]) {
            tasksByStatus[task.status].push(task);
          }
        });

        // Sort tasks in each status category
        Object.keys(tasksByStatus).forEach((status) => {
          tasksByStatus[status].sort((a, b) => {
            // First sort by priority
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const priorityDiff =
              priorityOrder[a.priority] - priorityOrder[b.priority];

            if (priorityDiff !== 0) return priorityDiff;

            // Then by due date if priority is the same
            const dateA = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000);
            const dateB = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000);
            return dateA - dateB;
          });
        });

        setTasks(tasksByStatus);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId, project, viewType, userDetails, selectedUserId, currentUser?.uid]);

  return {
    tasks,
    loading,
    error,
    currentProjectId: projectId,
    project,
    userDetails,
  };
};

export default useTasks;