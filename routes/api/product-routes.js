const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async(req, res) => {
  // find all products
    try {
      const productData = await Product.findAll({
        include: [{ model: Tag }, { model: Category }],
      });
      res.status(200).json(productData);
    } catch (err) {
      res.status(500).json(err);
    }
  // be sure to include its associated Category and Tag data
});

// get one product
router.get('/:id', async(req, res) => {
  // find a single product by its `id`
try {
  const productData = await Product.findByPk(req.params.id, {
    include: [{ model: Tag }, { model: Category }],
  });
  if (!productData) {
    res.status(404).json({ message: 'No product found with id!' });
    return;
  }
  res.status(200).json(productData)
} catch (err) {
  res.status(500).json(err);
}

  // be sure to include its associated Category and Tag data
});

// create new product
router.post('/', async(req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  

  try {
    const productData = await Product.create({
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock,
      category_id: req.body.category_id,
      tagIds: req.body.tagIds
    })
      .then((product) => {
        if (req.body.tagIds) {
          const productTagId = req.body.tagIds.map((tag_id) => {
            return {
              product_id: product.id,
              tag_id,
            };
          });
          return ProductTag.bulkCreate(productTagId)
        }
        res.status(200).json(productData)
      })
    .then((productTagIds)=> res.status(200).json(productTagIds))
  } catch (err) {
    res.status(400).json(err)
  }

});

// update product
router.put('/:id', async(req, res) => {
  // update product data
 const productData = await Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((productData) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  await Product.destroy({
    where: {
      id: req.params.id
    }
  });

  //product is deleted, need to delete all the product tags where product_id is the id
  await ProductTag.destroy({
    where: {
      product_id: req.params.id
    }
  });

  //send a res success
  res.json("success!")
});

module.exports = router;
