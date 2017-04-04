const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
//const dbFilestoreMgr = require('../modules/skill/dbFilestoreMgr');


router.get('/stepuiconfig/uiconfig/:templateId', (req, res) => {
    let templateId = req.params.templateId;
    
    skillController.getUIConfig(templateId, (error, data) => {
        if(!error) {
            res.send(data);
        }
        else {
            res.send(error);
        }
    });
});

router.get('/stepuiconfig/model/:templateId', (req, res) => {
    let templateId = req.params.templateId;
    
    skillController.getSkillModel(templateId, (error, data) => {
        if(!error) {
            res.send(data);
        }
        else {
            res.send(error);
        }
    });
});

router.get('/stepuiconfig/stepuistate/:taskId/:stepIndex', (req, res) => {
    
    let taskId = req.params.taskId;
    let stepIndex = req.params.stepIndex;
    
    skillController.getStepUIState(taskId, stepIndex, (error, data) => {
        if(!error) {
            res.send(data);
        }
        else {
            res.send(error);
        }
    });
});

router.get('/stepuiconfig/:templateId/:taskId/:stepIndex', (req, res) => {
    let templateId = req.params.templateId;
    let taskId = req.params.taskId;
    let stepIndex = req.params.stepIndex;
    
    skillController.getStepUIConfig(templateId, taskId, stepIndex, (error, data) => {
        if(!error) {
            res.send(data);
        }
        else {
            res.send(error);
        }
    });
});

router.post('/stepuistate/:taskId/:stepIndex', (req, res) => {
    let stepUIState = req.body.stepUIState;
    skillController.saveStepUIState(req.params.taskId, req.params.stepIndex, stepUIState, (error, data) => {
        if(!error) {
            res.send(data);
        }
        else {
            res.send(error);
        }
    });
});

router.get('/xmlgeneration/:templateId/:taskid/:stepidx', (req, res) => {
    let templateId = req.params.templateId;
    let taskId = req.params.taskid;
    let stepIdx = req.params.stepidx;
    
    skillController.generateXML(templateId, taskId, stepIdx, (error) => {
        if (!error) {
            res.send("success");
        } else {
            res.send(error);
        }
    });
});

router.post("/uploadresource", (req, res) => {
    //getting below data to be decided.
    let templateId = "";
    let taskId = "EXP16.WD.03.01.03.T1";
    let stepIndex = 1;
    let upload = skillController.saveResourceFile(templateId, taskId, stepIndex);
    upload(req, res, (error) => {
        if(error) {
            res.send("Error uploading file.");
        }
        else {
            res.end("File is uploaded");
        }
    });
});

module.exports = router;