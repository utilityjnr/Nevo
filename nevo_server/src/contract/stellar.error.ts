import { HttpException, HttpStatus } from '@nestjs/common';

const STELLAR_CODE_MAP: Record<
  string,
  { status: HttpStatus; message: string }
> = {
  tx_bad_auth: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Bad authentication',
  },
  op_underfunded: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Insufficient balance',
  },
};

export class StellarError extends HttpException {
  constructor(codeOrMessage: string) {
    const mapped = STELLAR_CODE_MAP[codeOrMessage];
    super(
      mapped?.message ?? codeOrMessage,
      mapped?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
