import Publisher from "../models/publisher.model.js";
import ApiError from "../api_error.js";

class PublisherController {

  // [POST] /api/publishers
  async create(req, res, next) {
    try {
      const publisher = new Publisher(req.body);
      await publisher.save();

      return res.send({ message: 'Publisher created successfully'});

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while creating a publisher'));
    };
  };

  // [PUT] /api/publishers/:publisherId
  async update(req, res, next) {
    try {
      const result = await Publisher.updateOne({ MANXB: req.params.publisherId }, req.body);

      if(result.matchedCount === 0) {
        return next(new ApiError(404, 'Publisher not found'));
      };

      return res.send({ message: 'Publisher updated successfully'});

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while updating a publisher'));
    };
  };

  // [GET] /api/publishers/:publisherId 
  async findOne(req, res, next) {
    try {
      const publisher = await Publisher.findOne({ MANXB: req.params.publisherId });

      if(!publisher) {
        return next(new ApiError(404, 'Publisher not found'));
      };

      return res.send(publisher);

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while retrieving a publisher'));
    };
  };

  // [GET] /api/publishers
  async findAll(req, res, next) {
    try {
      const publishers = await Publisher.find().lean();
      return res.send(publishers);

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while retrieving publishers'));
    };
  };

  // [DELETE] /api/publishers/:publisherId
  async delete(req, res, next) {
    try {
      const result = await Publisher.deleteOne({ MANXB: req.params.publisherId });

      if (result.deletedCount === 0) {
        return next(new ApiError(404, 'Publisher not found'));
      };

      return res.send({ message: 'Publisher deleted successfully' });

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while deleting a publisher'));
    };
  };

  // [DELETE] /api/publishers
  async deleteAll(req, res, next) {
    try {
      const result = await Publisher.deleteMany({});
      return res.send({ message: `${result.deletedCount} publishers deleted successfully` });

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while deleting all publishers'));
    };
  };

};

export default new PublisherController;
