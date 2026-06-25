import { gql } from "@apollo/client";

export const GENERATE_OTP_BY_EMAIL_REQUESTS = gql`
  mutation generateOtpByEmailRequests(
    $request: GenerateAndSendOTPByEmailRequestInput!
  ) {
    otpMutations {
      generateByEmail(request: $request) {
        data {
          otp
        }
        message
        statusCode
        success
      }
    }
  }
`;


