import Reader from '../models/reader.model.js';
import ApiError from '../api_error.js';

class ReaderController {

  // [POST] /api/readers
  async create(req, res, next) {
    try {
      const reader = new Reader(req.body);
      await reader.save();

      return res.send({ message: 'Reader created successfully'});

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while creating reader'));
    };
  };

  // [PUT] /api/readers/:readerId
  async update(req, res, next) {
    try {
      const result = await Reader.updateOne({ MADOCGIA: req.params.readerId }, req.body);
      
      if(result.matchedCount === 0) {
        return next(new ApiError(404, 'Reader not found'));
      }
      
      return res.send({ message: 'Reader updated successfully'});

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while updating reader'));
    };
  };

  // [GET] /api/readers/:readerId
  async findOne(req, res, next) {
    try {
      const reader = await Reader.findOne({ MADOCGIA: req.params.readerId });

      if(!reader) {
        return next(new ApiError(404, 'Reader not found'));
      };

      return res.send(reader);

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while retrieving a reader'));
    };
  };

  // [GET] /api/readers
  async findAll(req, res, next) {
    try {
      const readers = await Reader.find().lean();
      return res.send(readers);

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while retrieving readers'));
    };
  };

  // [DELETE] /api/readers/:readerId
  async delete(req, res, next) {
    try {
      const result = await Reader.deleteOne({ MADOCGIA: req.params.readerId });

      if(result.deletedCount === 0) {
        return next(new ApiError(404, 'Reader not found'));
      };
      
      return res.send({ message: 'Reader deleted successfully'});

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while deleting a reader'));
    };
  };

  // [DELETE] /api/readers
  async deleteAll(req, res, next) {
    try {
      const result = await Reader.deleteMany({});
      return res.send({ message: `${result.deletedCount} readers deleted successfully`}); 
       
    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while deleting readers'));
    };
  };

}

export default new ReaderController;
