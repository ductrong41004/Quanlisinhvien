package com.quanlysinhvien.repository;

import com.quanlysinhvien.model.ClassRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRoomRepository extends MongoRepository<ClassRoom, String> {

    Optional<ClassRoom> findByMaLop(String maLop);

    List<ClassRoom> findByTenLopContainingIgnoreCase(String tenLop);

    List<ClassRoom> findByKhoa(String khoa);

    boolean existsByMaLop(String maLop);
}
