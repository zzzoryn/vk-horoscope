const horoXmlUrl = 'https://ignio.com/r/export/utf/xml/daily/com.xml';

const months = ['января', 'февряля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

const horoscopes = [{
  name: 'aries',
  title: '&#9800; Овен',
  publishTime: '21:00:00',
  bgImage: 'https://i.postimg.cc/26yHMZqS/image.png'
}, {
  name: 'taurus',
  title: '&#9801; Телец',
  publishTime: '21:10:00',
  bgImage: 'https://i.postimg.cc/mZHxgvD2/image.png'
}, {
  name: 'gemini',
  title: '&#9802; Близнецы',
  publishTime: '21:20:00',
  bgImage: 'https://i.postimg.cc/j5f8Rrhp/image.png'
}, {
  name: 'cancer',
  title: '&#9803; Рак',
  publishTime: '21:30:00',
  bgImage: 'https://i.postimg.cc/qqLx7B65/image.png'
}, {
  name: 'leo',
  title: '&#9804; Лев',
  publishTime: '21:40:00',
  bgImage: 'https://i.postimg.cc/1t0pWRB3/image.png'
}, {
  name: 'virgo',
  title: '&#9805; Дева',
  publishTime: '21:50:00',
  bgImage: 'https://i.postimg.cc/6p95RW2h/image.png'
}, {
  name: 'libra',
  title: '&#9806; Весы',
  publishTime: '22:00:00',
  bgImage: 'https://i.postimg.cc/TYBZmGk4/image.png'
}, {
  name: 'scorpio',
  title: '&#9807; Скорпион',
  publishTime: '22:10:00',
  bgImage: 'https://i.postimg.cc/XvkhT5nR/image.png'
}, {
  name: 'sagittarius',
  title: '&#9808; Стрелец',
  publishTime: '22:20:00',
  bgImage: 'https://i.postimg.cc/JndTLcv2/image.png'
}, {
  name: 'capricorn',
  title: '&#9809; Козерог',
  publishTime: '22:30:00',
  bgImage: 'https://i.postimg.cc/vm2jYs6h/image.png'
}, {
  name: 'aquarius',
  title: '&#9810; Водолей',
  publishTime: '22:40:00',
  bgImage: 'https://i.postimg.cc/pdrG161F/image.png'
}, {
  name: 'pisces',
  title: '&#9811; Рыбы',
  publishTime: '22:50:00',
  bgImage: 'https://i.postimg.cc/nVBd57T0/image.png'
}];

module.exports = {
  horoXmlUrl,
  months,
  horoscopes
}
