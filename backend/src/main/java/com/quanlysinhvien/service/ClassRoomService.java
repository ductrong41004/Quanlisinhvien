package com.quanlysinhvien.service;

import com.quanlysinhvien.model.ClassRoom;
import com.quanlysinhvien.repository.ClassRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassRoomService {

    private final ClassRoomRepository classRoomRepository;

    public List<ClassRoom> getAllClasses() {
        return classRoomRepository.findAll();
    }

    public ClassRoom getClassById(String id) {
        return classRoomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp với ID: " + id));
    }

    public ClassRoom getClassByMaLop(String maLop) {
        return classRoomRepository.findByMaLop(maLop)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp với mã: " + maLop));
    }

    public ClassRoom createClass(ClassRoom classRoom) {
        if (classRoomRepository.existsByMaLop(classRoom.getMaLop())) {
            throw new RuntimeException("Mã lớp đã tồn tại: " + classRoom.getMaLop());
        }
        return classRoomRepository.save(classRoom);
    }

    public ClassRoom updateClass(String id, ClassRoom classDetails) {
        ClassRoom classRoom = getClassById(id);
        classRoom.setTenLop(classDetails.getTenLop());
        classRoom.setKhoa(classDetails.getKhoa());
        classRoom.setSiSo(classDetails.getSiSo());
        classRoom.setNamHoc(classDetails.getNamHoc());
        return classRoomRepository.save(classRoom);
    }

    public void deleteClass(String id) {
        ClassRoom classRoom = getClassById(id);
        classRoomRepository.delete(classRoom);
    }
}
