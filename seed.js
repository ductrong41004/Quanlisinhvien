const classes = [
  { maLop: "CNTT01", tenLop: "Công nghệ thông tin 01", khoa: "Công nghệ thông tin", siSo: 45, namHoc: "2023-2027" },
  { maLop: "CNTT02", tenLop: "Công nghệ thông tin 02", khoa: "Công nghệ thông tin", siSo: 40, namHoc: "2023-2027" },
  { maLop: "KTPM01", tenLop: "Kỹ thuật phần mềm 01", khoa: "Công nghệ thông tin", siSo: 35, namHoc: "2022-2026" },
  { maLop: "KTPM02", tenLop: "Kỹ thuật phần mềm 02", khoa: "Công nghệ thông tin", siSo: 50, namHoc: "2022-2026" },
  { maLop: "HTTT01", tenLop: "Hệ thống thông tin 01", khoa: "Công nghệ thông tin", siSo: 42, namHoc: "2021-2025" },
  { maLop: "MMT01", tenLop: "Mạng máy tính 01", khoa: "Công nghệ thông tin", siSo: 38, namHoc: "2023-2027" },
  { maLop: "QTKD01", tenLop: "Quản trị kinh doanh 01", khoa: "Kinh tế", siSo: 60, namHoc: "2023-2027" },
  { maLop: "KT01", tenLop: "Kế toán 01", khoa: "Kinh tế", siSo: 55, namHoc: "2022-2026" },
  { maLop: "NNA01", tenLop: "Ngôn ngữ Anh 01", khoa: "Ngoại ngữ", siSo: 30, namHoc: "2024-2028" },
  { maLop: "DDT01", tenLop: "Điện - Điện tử 01", khoa: "Điện tử", siSo: 48, namHoc: "2023-2027" }
];

const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const middleNames = ["Văn", "Thị", "Hữu", "Minh", "Quang", "Đức", "Ngọc", "Thanh", "Mạnh", "Xuân", "Thu", "Hải", "Tuấn", "Hoài", "Diệu", "Bảo", "Lan", "Hồng"];
const lastNames = ["Anh", "Bình", "Cường", "Dũng", "Em", "Phong", "Giang", "Hùng", "Hải", "Khánh", "Linh", "Minh", "Nga", "Oanh", "Phương", "Quyên", "Sơn", "Trang", "Uyên", "Vinh", "Khoa", "Đạt", "Tuấn", "Thảo", "Vy", "Yến"];
const addresses = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Thanh Hóa", "Nghệ An", "Đồng Nai", "Bình Dương", "Quảng Ninh", "Bắc Ninh", "Huế"];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

async function seedData() {
  console.log("🚀 Bắt đầu tạo 10 Lớp học...");
  for (const c of classes) {
    try {
      const res = await fetch("http://localhost:8080/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c)
      });
      if (res.ok) {
        console.log(`✅ Đã tạo lớp ${c.maLop}`);
      } else {
        console.log(`⚠️ Lỗi khi tạo lớp ${c.maLop}`);
      }
    } catch (err) {
      console.log(`❌ Lỗi kết nối: ${err.message}`);
    }
  }

  console.log("\n🚀 Bắt đầu tạo 100 Sinh viên...");
  
  for (let i = 1; i <= 100; i++) {
    const maSv = `SV${String(i).padStart(4, "0")}`; // SV0001
    const hoTen = `${getRandom(firstNames)} ${getRandom(middleNames)} ${getRandom(lastNames)}`;
    const isMale = Math.random() > 0.5;
    const gioiTinh = isMale ? "Nam" : "Nữ";
    const ngaySinh = getRandomDate(new Date(2000, 0, 1), new Date(2005, 11, 31));
    const maLop = getRandom(classes).maLop;
    const phonePrefix = ["09", "08", "03", "07", "05"][Math.floor(Math.random() * 5)];
    const soDienThoai = `${phonePrefix}${Math.floor(10000000 + Math.random() * 90000000)}`;
    const email = `sv${i}@gmail.com`;
    const diaChi = getRandom(addresses);

    const student = { maSv, hoTen, ngaySinh, gioiTinh, maLop, email, soDienThoai, diaChi };

    try {
      const res = await fetch("http://localhost:8080/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student)
      });
      if (res.ok) {
        console.log(`✅ Đã tạo SV: ${maSv} - ${hoTen}`);
      } else {
        console.log(`⚠️ Lỗi khi tạo SV: ${maSv}`);
      }
    } catch (err) {
      console.log(`❌ Lỗi kết nối: ${err.message}`);
    }
  }
  
  console.log("\n🎉 HOÀN TẤT TẠO DATA!");
}

seedData();
