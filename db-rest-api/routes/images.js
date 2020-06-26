const express = require('express');
const router = express.Router();
const yaml = require('js-yaml');
const fs = require('fs');

/* docker image 파일 관리 객체 반환 */
router.get('/', (req, res) => {
    try{
        // let images_yaml = yaml.safeLoad(fs.readFileSync('C:\\Users\\admin\\Desktop\\linux\\online-ide\\db-rest-api\\images.yaml', 'utf8'));
        let images_yaml = yaml.safeLoad(fs.readFileSync('C:\\Users\\admin\\Desktop\\gitlab\\online-ide\\db-rest-api\\images.yaml', 'utf8'));
        res.status(200).send({isError: false, yaml: images_yaml});
    }catch(e){
        console.log(e);
        res.status(304).send({isError: true, errorMessage: e});
    }    
});


module.exports = router
