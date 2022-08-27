const { Province } = require("../models");
const createError = require("../utils/createError");

exports.addProvince = async () => {
  try {
    const province = await Province.bulkCreate([
      { name: "กรุงเทพมหานคร" },
      { name: "สมุทรปราการ" },
      { name: "นนทบุรี" },
      { name: "ปทุมธานี" },
      { name: "พระนครศรีอยุธยา" },
      { name: "อ่างทอง" },
      { name: "ลพบุรี" },
      { name: "สิงห์บุรี" },
      { name: "ชัยนาท" },
      { name: "สระบุรี" },
      { name: "ชลบุรี" },
      { name: "ระยอง" },
      { name: "จันทบุรี" },
      { name: "ตราด" },
      { name: "ฉะเชิงเทรา" },
      { name: "ปราจีนบุรี" },
      { name: "นครนายก" },
      { name: "สระแก้ว" },
      { name: "นครราชสีมา" },
      { name: "บุรีรัมย์" },
      { name: "สุรินทร์" },
      { name: "ศรีสะเกษ" },
      { name: "อุบลราชธานี	" },
      { name: "ยโสธร" },
      { name: "ชัยภูมิ" },
      { name: "อำนาจเจริญ" },
      { name: "หนองบัวลำภู" },
      { name: "ขอนแก่น" },
      { name: "อุดรธานี" },
      { name: "เลย" },
      { name: "หนองคาย" },
      { name: "มหาสารคาม" },
      { name: "ร้อยเอ็ด" },
      { name: "กาฬสินธุ์" },
      { name: "สกลนคร" },
      { name: "นครพนม" },
      { name: "มุกดาหาร" },
      { name: "เชียงใหม่" },
      { name: "ลำพูน" },
      { name: "ลำปาง" },
      { name: "อุตรดิตถ์" },
      { name: "แพร่" },
      { name: "น่าน" },
      { name: "พะเยา" },
      { name: "เชียงราย" },
      { name: "แม่ฮ่องสอน" },
      { name: "นครสวรรค์" },
      { name: "อุทัยธานี" },
      { name: "กำแพงเพชร" },
      { name: "ตาก" },
      { name: "สุโขทัย" },
      { name: "พิษณุโลก" },
      { name: "พิจิตร" },
      { name: "เพชรบูรณ์" },
      { name: "ราชบุรี" },
      { name: "กาญจนบุรี" },
      { name: "สุพรรณบุรี" },
      { name: "นครปฐม" },
      { name: "สมุทรสาคร" },
      { name: "สมุทรสงคราม" },
      { name: "เพชรบุรี" },
      { name: "ประจวบคีรีขันธ์" },
      { name: "นครศรีธรรมราช" },
      { name: "กระบี่" },
      { name: "พังงา" },
      { name: "ภูเก็ต" },
      { name: "สุราษฎร์ธานี" },
      { name: "ระนอง" },
      { name: "ชุมพร" },
      { name: "สงขลา" },
      { name: "สตูล" },
      { name: "ตรัง" },
      { name: "พัทลุง" },
      { name: "ปัตตานี" },
      { name: "ยะลา" },
      { name: "นราธิวาส" },
      { name: "บึงกาฬ" },
    ]);
  } catch (err) {
    // console.log(err);
    createError("Invalid credential", 400);
  }
};
