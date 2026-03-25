package com.quanlysinhvien.repository;

import com.quanlysinhvien.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

    Optional<Student> findByMaSv(String maSv);

    @Query("{ 'hoTen': { $regex: ?0, $options: 'i' } }")
    List<Student> findByHoTenContainingIgnoreCase(String hoTen);

    List<Student> findByMaLop(String maLop);

    List<Student> findByGioiTinh(String gioiTinh);

    List<Student> findByMaLopAndGioiTinh(String maLop, String gioiTinh);

    @Query("{ $or: [ { 'hoTen': { $regex: ?0, $options: 'i' } }, { 'maSv': { $regex: ?0, $options: 'i' } } ] }")
    List<Student> searchByKeyword(String keyword);

    boolean existsByMaSv(String maSv);
}
