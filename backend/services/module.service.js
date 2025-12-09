const moduleRepository = require('../repositories/module.repository');

const createModule = async (data) => {
    const { intProjectId, intNodeType, varModuleName, intCreatedBy, intParentId } = data;

    const params = {
        _intKey: 1,
        _intId: 0,
        _intProjectId: intProjectId,
        _intNodeType: intNodeType,
        _varModuleName: varModuleName,
        _intCreatedBy: intCreatedBy,
        _intActive: 1,
        _intParentId: intParentId
    };

    return await moduleRepository.createModule(params);
};


const getModules = async (projectId, mode) => {
    const modules = await moduleRepository.getModules(projectId);

    if (mode === "tree") {
        return buildTree(modules);
    }

    return modules;  // flat list
};

function buildTree(list) {
    const map = {};
    const roots = [];

    // Step 1: create map
    list.forEach(item => {
        map[item.intId] = { ...item, children: [] };
    });

    // Step 2: connect children
    list.forEach(item => {
        const node = map[item.intId];

        if (!item.intParentId) {
            // NULL or 0 treated as root
            roots.push(node);
        } else {
            if (map[item.intParentId]) {
                map[item.intParentId].children.push(node);
            }
        }
    });

    return roots;
}


const updateModule = async (id, data) => {
  const params = {
    _intKey: 2,
    _intId: id,
    _intProjectId: data.intProjectId,
    _intNodeType: data.intNodeType,
    _varModuleName: data.varModuleName,
    _intCreatedBy: data.intCreatedBy || null,
    _intActive: data.intActive !== undefined ? data.intActive : 1,
    _intParentId: data.intParentId || null
  };
  return await moduleRepository.callModuleProcedure(params);
};

const deleteModule = async (id) => {
  const params = {
    _intKey: 3,
    _intId: id,
    _intProjectId: null,
    _intNodeType: null,
    _varModuleName: null,
    _intCreatedBy: null,
    _intActive: 0,
    _intParentId: null
  };
  return await moduleRepository.callModuleProcedure(params);
};
const getModuleSummary = async (projectId) => {
  return await moduleRepository.getModuleSummary(projectId);
};

module.exports = {createModule,getModules,updateModule,deleteModule,getModuleSummary}