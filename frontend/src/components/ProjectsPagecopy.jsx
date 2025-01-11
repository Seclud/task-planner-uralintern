import React, { useEffect, useState } from 'react';
import { api } from '../api';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects/');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <h1>Projects</h1>
      {projects.length > 0 ? (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <h2>{project.name}</h2>
              <p>Efficiency: {project.efficiency}%</p>
              <p>Your Role: {project.user_role}</p>
              <h3>Participants:</h3>
              <ul>
                {project.participants.map((participant) => (
                  <li key={participant.id}>
                    {participant.full_name} ({participant.role})
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects available.</p>
      )}
    </div>
  );
}

export default ProjectsPage;