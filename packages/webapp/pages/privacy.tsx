import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/privacy-policy',
      permanent: true,
    },
  };
};

export default function PrivacyRedirect() {
  return null;
}
