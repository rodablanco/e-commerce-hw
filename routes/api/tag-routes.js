const router = require("express").Router();
const { Tag, Product } = require("../../models");
const { sync } = require("../../models/Product");

// The `/api/tags` endpoint

router.get("/", async (req, res) => {
  // find all tags
  // be sure to include its associated Product data

  const tags = await Tag.findAll({ include: [{ model: Product }] });
  res.json(tags);
});

router.get("/:id", async(req, res) => {
  // find a single tag by its `id`
  try {
    const tags = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
  
    if (!tags) {
      res.status(404).json({ message: 'No tag was found' });
      return;
    }
    res.status(200).json(tags);
    
  } catch (err) {
    res.status(200).json(err)
  }

  // be sure to include its associated Product data
});

router.post("/", async(req, res) => {
  // create a new tag
  // Need to work on this code. Ask for help?
 

  try {
    const tags = await Tag.create({
      tag_name: req.body.tag_name,
    });
    res.status(200).json(tags)
    console.log("response data?", tags)    
  } catch (err) {
   console.log('error happens here!')
    res.status(400).json(err)
  }
});

router.put("/:id", async(req, res) => {
  // update a tag's name by its `id` value

  //need help
  try {
    const tags = await Tag.update(req.body, {
      where: {
        id: req.params.id
      }
    })
    if (!tags){
      res.status(404).json({ message: 'No tag found with that ID.' });
      return;
    }
    res.status(400).json(tags)
    
  } catch (err) {
    res.status(500).json(err)
  }
});

router.delete("/:id", async(req, res) => {
  // delete on tag by its `id` value
  //need help
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      }
    });
    if (!tagData) {
      res.status(404).json({ message: 'No tag found with that id' });
      return
    }
    res.status(200).json(tagData)
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
