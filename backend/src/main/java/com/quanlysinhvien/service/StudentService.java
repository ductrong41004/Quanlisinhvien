package com.quanlysinhvien.service;

import com.quanlysinhvien.model.Student;
import com.quanlysinhvien.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên với ID: " + id));
    }

    public Student getStudentByMaSv(String maSv) {
        return studentRepository.findByMaSv(maSv)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên với mã: " + maSv));
    }

    public Student createStudent(Student student) {
        if (studentRepository.existsByMaSv(student.getMaSv())) {
            throw new RuntimeException("Mã sinh viên đã tồn tại: " + student.getMaSv());
        }
        return studentRepository.save(student);
    }

    public Student updateStudent(String id, Student studentDetails) {
        Student student = getStudentById(id);
        student.setMaSv(studentDetails.getMaSv());
        student.setHoTen(studentDetails.getHoTen());
        student.setNgaySinh(studentDetails.getNgaySinh());
        student.setGioiTinh(studentDetails.getGioiTinh());
        student.setMaLop(studentDetails.getMaLop());
        student.setEmail(studentDetails.getEmail());
        student.setSoDienThoai(studentDetails.getSoDienThoai());
        student.setDiaChi(studentDetails.getDiaChi());
        return studentRepository.save(student);
    }

    public void deleteStudent(String id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }

    public List<Student> searchStudents(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllStudents();
        }
        return studentRepository.searchByKeyword(keyword.trim());
    }

    public List<Student> filterStudents(String maLop, String gioiTinh) {
        if (maLop != null && !maLop.isEmpty() && gioiTinh != null && !gioiTinh.isEmpty()) {
            return studentRepository.findByMaLopAndGioiTinh(maLop, gioiTinh);
        } else if (maLop != null && !maLop.isEmpty()) {
            return studentRepository.findByMaLop(maLop);
        } else if (gioiTinh != null && !gioiTinh.isEmpty()) {
            return studentRepository.findByGioiTinh(gioiTinh);
        }
        return getAllStudents();
    }
}
