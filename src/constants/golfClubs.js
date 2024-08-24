import coxmoor from "../assets/courses/coxmoor.png"
import worksop from "../assets/courses/worksop.png"
import newark from "../assets/courses/newark.png"
import radcliffe from "../assets/courses/radcliffe.png"
import bondhay from "../assets/courses/bondhay.png"
import wollaton from "../assets/courses/wollaton.png"
import brierly from "../assets/courses/brierly.png"
import ramsdale from "../assets/courses/ramsdale.png"
import oakmere from "../assets/courses/oakmere.png"
import ruddington from "../assets/courses/ruddington.png"
import bulwell from "../assets/courses/bulwell.png"
import coxmoorLogo from "../assets/courses/logos/coxmoorLogo.png"
import bondhayLogo from "../assets/courses/logos/bondhayLogo.png"
import worksopLogo from "../assets/courses/logos/worksopLogo.png"
import newarkLogo from "../assets/courses/logos/newarkLogo.png"
import radcliffeLogo from "../assets/courses/logos/radcliffeLogo.png"
import wollatonLogo from "../assets/courses/logos/wollatonLogo.png"
import brierlyLogo from "../assets/courses/logos/brierlyLogo.png"
import ramsdaleLogo from "../assets/courses/logos/ramsdaleLogo.png"
import oakmereLogo from "../assets/courses/logos/oakmereLogo.png"
import ruddingtonLogo from "../assets/courses/logos/ruddingtonLogo.png"
import bulwellLogo from "../assets/courses/logos/bulwellLogo.png"




export const clubs = [
  {
    name: "Coxmoor Golf Club",
    address: "Coxmoor House, Coxmoor Road, Sutton-in-Ashfield, NG17 5LF",
    date: "07/03/2024",
    dayName: "Wed",
    day: "07",
    month: "3",
    monthName: "March",
    year: "2024",
    comp: "Order of Merit",
    courseImage: coxmoor,
    contact: "01623 557359",
    link: "https://www.coxmoorgolfclub.co.uk/",
    logo: coxmoorLogo,
  },
  {
    name: "Worksop Golf Club",
    address: "51 Windmill Lane, Worksop, S80 2SQ",
    dayName: "Wed",
    day: "21",
    month: "3",
    monthName: "March",
    year: "2024",
    comp: "Order of Merit",
    courseImage: worksop,
    contact: "01909 477731",
    link: "https://www.worksopgolfclub.com/",
    logo: worksopLogo,
  },
  {
    name: "Newark Golf Club",
    address: "Sleaford Road, Coddington, Newark, NG24 2QX",
    dayName: "Wed",
    day: "04",
    month: "4",
    monthName: "April",
    year: "2024",
    comp: "Order of Merit",
    courseImage: newark,
    contact: "01636 626282",
    link: "https://www.newarkgolfclub.co.uk/",
    logo: newarkLogo,
  },
  {
    name: "Radcliffe On Trent",
    address: "Dewberry Ln, Radcliffe on Trent, Nottingham NG12 2JH",
    dayName: "Thurs",
    day: "07",
    month: "9",
    monthName: "September",
    year: "2024",
    comp: "Order of Merit",
    courseImage: radcliffe,
    contact: "01159 333000",
    link: "https://www.radcliffeontrentgc.co.uk/",
    logo: radcliffeLogo,
  },
  {
    name: "Bondhay Golf Club",
    address: "Bondhay Ln, Whitwell Common, Worksop S80 3EH",
    dayName: "Wed",
    day: "27",
    month: "9",
    monthName: "September",
    year: "2024",
    comp: "Order of Merit",
    courseImage: bondhay,
    contact: "01909 723608",
    link: "https://bondhaygolfclub.com/",
    logo: bondhayLogo,
  },
  {
    name: "Wollaton Park Golf Club",
    address: "Lime Tree Ave, Nottingham NG8 1BT",
    dayName: "Tues",
    day: "10",
    month: "10",
    monthName: "October",
    year: "2024",
    comp: "Order of Merit",
    courseImage: wollaton,
    contact: "0115 9787574",
    link: "https://www.wollatonparkgolfclub.com/",
    logo: wollatonLogo,
  },
  {
    name: "Brierley Forest Golf Club",
    address: "160 Main St, Huthwaite, Sutton-in-Ashfield NG17 2LG",
    dayName: "Wed",
    day: "18",
    month: "10",
    monthName: "October",
    year: "2024",
    comp: "Team Event Pairs",
    courseImage: brierly,
    contact: "01623 550761",
    link: "https://www.brierleyforestgolfclub.com/",
    logo: brierlyLogo,
  },
  {
    name: "Ramsdale Golf Club",
    address: "Oxton Rd, Calverton, Nottingham NG14 6NU",
    dayName: "Wed",
    day: "01",
    month: "11",
    monthName: "November",
    year: "2024",
    comp: "Order of Merit",
    courseImage: ramsdale,
    contact: "0115 9655600",
    link: "https://ramsdaleparkgc.co.uk/",
    logo: ramsdaleLogo,
  },
  {
    name: "Oakmere Park Golf Club",
    address: "Oaks Ln, Oxton, Southwell NG25 0RH",
    dates: [
      "15/11/2024",
      "",
    ],
    comp: "Order of Merit",
    courseImage: oakmere,
    contact: "0115 9653545",
    link: "https://oakmerepark.co.uk/",
    logo: oakmereLogo,
  },
  {
    name: "Ruddington Golf Club",
    address: "Wilford Rd, Ruddington, Nottingham NG11 6NB",
    dates: [
      "28/11/2024",
    ],
    comp: "Order of Merit",
    courseImage: ruddington,
    contact: "0115 9214139",
    link: "https://www.ruddingtongrange.com/",
    logo: ruddingtonLogo,
  },
  {
    name: "Bulwell Forest Golf Club",
    address: "Forest Golf Club, Hucknall Rd, Bulwell, Nottingham NG6 9LQ",
    dates: [
      "17/01/2024",
    ],
    comp: "Order of Merit",
    courseImage: bulwell,
    contact: "0115 9763172",
    link: "https://www.bulwellforestgolfclub.co.uk/",
    logo: bulwellLogo,
  },
].sort((a, b) => {
  const aMilli = new Date(
    `${a.month}/${a.day}/${a.year}`
  ).getTime();
  const bMilli = new Date(
    `${b.month}/${b.day}/${b.year}`
  ).getTime();
  return aMilli - bMilli;
});