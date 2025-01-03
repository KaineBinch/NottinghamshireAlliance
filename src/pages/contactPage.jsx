import PageHeader from "../components/pageHeader";
import Socials from "../components/socials";
import Contacts from "../components/contacts";
import { MODELS, QUERIES } from "../constants/api";
import useFetch from "../utils/hooks/useFetch";
import { queryBuilder } from "../utils/queryBuilder";
const ContactPage = () => {
  const contactQuery = queryBuilder(MODELS.contact, QUERIES.contactQuery);
  const {
    isLoading: isLoadingContacts,
    isError: isErrorContacts,
    data: contactData,
    error: errorContacts,
  } = useFetch(contactQuery);

  const socialQuery = queryBuilder(MODELS.social, QUERIES.socialQuery);
  const {
    isLoading: isLoadingSocials,
    isError: isErrorSocials,
    data: socialData,
    error: errorSocials,
  } = useFetch(socialQuery);

  if (isLoadingContacts || isLoadingSocials) {
    return <p className="pt-[85px]">Loading...</p>;
  }

  if (isErrorContacts || isErrorSocials) {
    console.error("Error fetching data:", errorContacts || errorSocials);
    return (
      <div className="pt-[85px]">
        <p>Something went wrong...</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Contact" />
      <hr className="border-black" />
      <div className="bg-[#D9D9D9] h-full">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-black">
          <div className="text-left">
            <h2 className="text-left my-3">Social Media</h2>
            {socialData?.data && socialData.data.length > 0 ? (
              socialData.data.map((social, i) => (
                <Socials
                  key={i}
                  icon={social.platformFAIcon}
                  link={social.platformURL}
                />
              ))
            ) : (
              <p>No social media links available.</p>
            )}

            {contactData?.data && contactData.data.length > 0 ? (
              contactData.data.map((contact, i) => (
                <Contacts
                  key={i}
                  name={contact.name}
                  position={contact.position}
                  tel={contact.tel}
                  email={contact.email}
                />
              ))
            ) : (
              <p>No contact information available.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
