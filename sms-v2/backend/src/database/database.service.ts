import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Student, StudentDocument } from '../students/schemas/student.schema';
import { Class, ClassDocument } from '../classes/schemas/class.schema';
import { Grade, GradeDocument } from '../grades/schemas/grade.schema';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
  ) {}

  async seed() {
    this.logger.log('Seeding database...');
    
    // Clear current data
    await this.userModel.deleteMany({});
    await this.studentModel.deleteMany({});
    await this.classModel.deleteMany({});
    await this.gradeModel.deleteMany({});

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Create Teacher
    const teacherUser: any = await this.userModel.create({
      username: 'teacher_01',
      password: hashedPassword,
      email: 'teacher@school.com',
      role: UserRole.TEACHER,
    });

    // 2. Create Admin
    await this.userModel.create({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@school.com',
      role: UserRole.ADMIN,
    });

    // 3. Create Class
    const classA: any = await this.classModel.create({
      name: 'Lớp 12A1',
      academicYear: '2025-2026',
      teacher: teacherUser._id,
      department: 'Tự nhiên',
    });

    const classB: any = await this.classModel.create({
      name: 'Lớp 12B2',
      academicYear: '2025-2026',
      teacher: teacherUser._id,
      department: 'Xã hội',
    });

    // 4. Create Students
    const names = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức', 'Vũ Tuyết Anh'];
    const students: any[] = [];
    
    for (let i = 0; i < 5; i++) {
        const user: any = await this.userModel.create({
            username: `student_0${i+1}`,
            password: hashedPassword,
            email: `student_0${i+1}@school.com`,
            role: UserRole.STUDENT,
        });

        const student: any = await this.studentModel.create({
            user: user._id,
            studentCode: `SV202600${i+1}`,
            fullName: names[i],
            dob: new Date('2008-05-15'),
            gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
            class: i < 3 ? classA._id : classB._id,
            address: 'Hà Nội, Việt Nam',
            phoneNumber: `098765432${i}`,
        });
        students.push(student);
    }

    // 5. Create some Grades
    for (const student of students) {
        await this.gradeModel.create({
            student: student._id,
            subjectName: 'Toán học',
            semester: 'Học kỳ 1',
            midtermScore: 7 + Math.random() * 3,
            finalScore: 6 + Math.random() * 4,
        });
        await this.gradeModel.create({
            student: student._id,
            subjectName: 'Vật lý',
            semester: 'Học kỳ 1',
            midtermScore: 5 + Math.random() * 5,
            finalScore: 5 + Math.random() * 5,
        });
    }

    return {
      message: 'Database seeded successfully',
      stats: {
        users: await this.userModel.countDocuments(),
        classes: await this.classModel.countDocuments(),
        students: await this.studentModel.countDocuments(),
        grades: await this.gradeModel.countDocuments(),
      }
    };
  }
}
