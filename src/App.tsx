import React, { use } from 'react';
import { useFamilyStore } from './store/useFamilyStore';
import { Layout } from './components/Layout';
import { TaskBoard } from './components/TaskBoard'; // El que generaremos a continuación

// Ejemplo de fetch de datos usando la nueva API 'use' de React 19
const fetchInitialData = async () => {
  // Aquí iría tu llamada a Hono.js / Supabase
  return { familyName: "The Millers" };
};

const dataPromise = fetchInitialData();

export default function App() {
  const data = use(dataPromise);
  const { activeProfile } = useFamilyStore();

  // if (!activeProfile) {
  //   return (
  //     <>
  //       <div>login</div>
  //     </>
  //   )
  //   //<LoginView />; // Pantalla de bienvenida
  // }

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-4xl font-black text-primary">
          ¡Hola de nuevo, Mario! 👋
        </h1>
        <p className="text-slate-500">Hoy es un gran día para completar tareas en el hogar {data.familyName}.</p>
      </header>

      <TaskBoard />
    </Layout>
  );
}