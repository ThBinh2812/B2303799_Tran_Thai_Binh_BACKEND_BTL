import Publisher from "../models/publisher.model.js";
import ApiError from "../api_error.js";

async function generatePublisherCode() {
  const publishers = await Publisher.find({}, "MANXB").lean();

  const codes = publishers.map((p) => p.MANXB).sort();

  const usedNumbers = codes
    .map((code) => parseInt(code.replace("NXB", ""), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  let nextNumber = usedNumbers.length + 1;
  for (let i = 0; i < usedNumbers.length; i++) {
    if (usedNumbers[i] !== i + 1) {
      nextNumber = i + 1;
      break;
    }
  }

  return `NXB${nextNumber.toString().padStart(3, "0")}`;
}

class PublisherController {

  // [POST] /api/publishers
  async create(req, res, next) {
    try {
      const MANXB = await generatePublisherCode();

      const existed = await Publisher.findOne({ MANXB });
      if (existed) {
        return next(new ApiError(400, "Mã nhà xuất bản đã tồn tại"));
      }

      const publisher = new Publisher({
        MANXB,
        ...req.body,
      });
      await publisher.save();

      return res.send({ 
        status: 'success',
        message: 'Tạo thành công',
        data: publisher,
      });

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

      return res.send({
        status: "success",
        message: "Cập nhật nhà xuất bản thành công",
        data: await Publisher.findOne({ MANXB: req.params.publisherId }),
      });

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

      return res.send({
        status: "success",
        message: "Lấy danh sách thành công",
        data: publishers,
      });
      
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

      return res.send({
        status: "success",
        message: "Xóa nhà xuất bản thành công",
        data: null,
      });

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

export default new PublisherController();
