package com.quanlysinhvien.controller;

import com.quanlysinhvien.model.Student;
import com.quanlysinhvien.service.ExportService;
import com.quanlysinhvien.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;
    private final ExportService exportService;

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable String id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/ma/{maSv}")
    public ResponseEntity<Student> getStudentByMaSv(@PathVariable String maSv) {
        return ResponseEntity.ok(studentService.getStudentByMaSv(maSv));
    }

    @PostMapping
    public ResponseEntity<Student> createStudent(@Valid @RequestBody Student student) {
        return ResponseEntity.ok(studentService.createStudent(student));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable String id,
                                                  @Valid @RequestBody Student student) {
        return ResponseEntity.ok(studentService.updateStudent(id, student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Student>> searchStudents(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(studentService.searchStudents(keyword));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Student>> filterStudents(
            @RequestParam(required = false) String maLop,
            @RequestParam(required = false) String gioiTinh) {
        return ResponseEntity.ok(studentService.filterStudents(maLop, gioiTinh));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCSV() throws IOException {
        List<Student> students = studentService.getAllStudents();
        byte[] data = exportService.exportStudentsToCSV(students);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=danh-sach-sinh-vien.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() throws IOException {
        List<Student> students = studentService.getAllStudents();
        byte[] data = exportService.exportStudentsToExcel(students);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=danh-sach-sinh-vien.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}
