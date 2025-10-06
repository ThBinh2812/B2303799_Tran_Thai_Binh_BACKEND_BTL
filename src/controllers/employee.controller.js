import Employee from '../models/employee.model.js';
import ApiError from '../api_error.js';

class EmployeeController {

  // [POST] /api/employees
  async create(req, res, next) {
    try {
      const employee = new Employee(req.body);
      await employee.save();

      return res.send({ message: 'Employee created successfully'});

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while creating a employee'));
    };
  };

  // [PUT] /api/employees/:employeeId
  async update(req, res, next) {
    try {
      const result = await Employee.updateOne({ MSNV: req.params.employeeId }, req.body);

      if(result.matchedCount === 0) {
        return next(new ApiError(404, 'Employee not found'));
      };

      return res.send({ message: 'Employee updated successfully' });

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while updating a employee'));
    };
  };

  // [GET] /api/employees/:employeeId
  async findOne(req, res, next) {
    try {
      const employee = await Employee.findOne({ MSNV: req.params.employeeId });

      if(!employee) {
        return next(new ApiError(404, 'Employee not found'));
      };
      
      return res.send(employee);

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while retrieving a employee'));
    };
  };

  // [GET] /api/employees
  async findAll(req, res, next) {
    try {
      const employees = await Employee.find().lean();
      return res.send(employees);

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while retrieving employees'));
    };
  };

  // [DELETE] /api/employees/:employeeId
  async delete(req, res, next) {
    try {
      const result = await Employee.deleteOne({ MSNV: req.params.employeeId });

      if(result.deletedCount === 0) {
        return next(new ApiError(404, 'Employee not found'));
      };

      return res.send({ message: 'Employee deleted successfully'});

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while deleting a employee'));
    };
  };

  // [DELETE] /api/employees
  async deleteAll(req, res, next) {
    try {
      const result = await Employee.deleteMany({});
      return res.send({ message: `${result.deletedCount} employees deleted successfully`});

    } catch(error) {
      console.log(error);
      return next(new ApiError(500, 'An error occurred while deleting employees'));
    };
  }

} 

export default new EmployeeController;
