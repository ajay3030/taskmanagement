import { BrowserRouter, Routes, Route } from "react-router-dom";
import MasterTypeForm from './components/master/MasterTypeForm';
import MasterDetailForm from './components/master/MasterDetailForm'
import HomePage from './components/homePage/HomePage';

// new module components
import ModuleList from './components/module/ModuleList';
// import ModuleCreateForm from './components/Backup/ModuleCreateForm';
// import ModuleTree from './components/module/ModuleTree';
import TaskList from "./components/taskList/TaskList";
function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {<HomePage />}></Route>
        <Route path="/master-type" element={<MasterTypeForm />} />
        <Route path="/master-detail" element={<MasterDetailForm />} />

        {/* Module routes (option B) */}
        <Route path="/module-list" element={<ModuleList />} />
        {/* <Route path="/module-add" element={<ModuleCreateForm />} />
        <Route path="/module-tree" element={<ModuleTree />} /> */}
        <Route path="/task-list" element={<TaskList/>}></Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;

