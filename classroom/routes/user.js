const express = require("express");
const router = express.Router();


//index -users
router.get("/",(req,res) =>{
    res.send(" Get for users");
});
//show -users
router.get("/:id",(req,res) =>{
    res.send(" Get for users:id");
});
//post -users
router.post("/",(req,res) =>{
    res.send("  post for users");
});

//delete -users
router.delete("/:id",(req,res) =>{
    res.send(" Delete user id");
});

module.exports = router;