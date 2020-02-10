const express = require('express');
const router = express.Router();
const passageController = require('../controllers/passageController');
const chapterController = require('../controllers/chapterController');

router.post(/\/add_passage\/?/, (req, res) => {
    let chapterID = req.body.chapterID;
    let type = req.body.type;
    let user = req.session.user_id || null;
    let backURL=req.header('Referer') || '/';
    let content = req.body.passage || '';
    let callback = function(){
        res.redirect(backURL);
    };
    switch(type) {
        case 'passage':
            passageController.addPassage({
                'chapter': chapterID,
                'content': content,
                'author': user,
                'callback': callback
            });
            break;
        case 'chapter':
            chapterController.addChapter({
                'title': content,
                'author': user,
                'callback': callback
            });
            break;
        case '':
        default:
            //TODO: Handle Empty Content Case, etc.
            break;
    }
});
router.put(/\/update_passage\/?/, passageController.updatePassage);
router.delete(/\/delete_passage\/?/, passageController.deletePassage);
router.delete(/\/delete_category\/?/, chapterController.deleteChapter);

module.exports = router;