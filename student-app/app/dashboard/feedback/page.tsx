import FeedbackForm from '@/_components/feedback/feedback-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Admin - Feedback Form',
  description: 'Send feedback or messages to the admin'
};

export default function FeedbackPage() {
  return <FeedbackForm />;
}