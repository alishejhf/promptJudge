import express from 'express'

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Compare route works');
});

export default router;