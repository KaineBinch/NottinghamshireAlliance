import Contacts from "../components/contacts";
import PageHeader from "../components/pageHeader";
import Socials from "../components/socials";
import { contact } from "../constants/contact";
import { socials } from "../constants/socials";

const ContactPage = () => {
  return (
    <>
      <PageHeader title="Contact" />
      <hr className="border-black" />
      <div className="bg-[#D9D9D9] h-full">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 ">
          <div>
            {socials.map((social, i) => (
              <Socials key={i} icon={social.icon} link={social.link} />
            ))}
            {contact.map((contact, i) => (
              <Contacts
                key={i}
                name={contact.name}
                position={contact.position}
                tel={contact.tel}
                email={contact.email}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default ContactPage;
