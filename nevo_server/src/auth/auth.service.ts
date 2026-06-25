import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Keypair } from '@stellar/stellar-sdk';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { randomBytes } from 'crypto';
import { StrKey } from '@stellar/stellar-sdk';

export interface VerifyDto {
  publicKey: string;
  signature: string;
  message: string;
}

export interface AuthResult {
  accessToken: string;
}

export interface ChallengeResult {
  nonce: string;
  expiresAt: number;
}

interface ChallengeEntry {
  nonce: string;
  expiresAt: number;
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly challenges = new Map<string, ChallengeEntry>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    setInterval(() => this.cleanupExpiredChallenges(), CHALLENGE_TTL_MS);
  }

  generateChallenge(publicKey: string): ChallengeResult {
    if (!publicKey) {
      throw new BadRequestException('publicKey is required');
    }

    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
      throw new BadRequestException('Invalid Stellar public key format');
    }

    const nonce = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + CHALLENGE_TTL_MS;

    this.challenges.set(publicKey, { nonce, expiresAt });

    return { nonce, expiresAt };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async verify(dto: VerifyAuthDto): Promise<AuthResult> {
    const nonceEntry = this.nonces.get(dto.publicKey);

    if (!nonceEntry || nonceEntry.expiresAt < Date.now()) {
      this.nonces.delete(dto.publicKey);
      throw new UnauthorizedException('Nonce expired or not found');
    }

    if (nonceEntry.value !== dto.nonce) {
      throw new UnauthorizedException('Invalid nonce');
    }

    if (!this.verifySignature(dto.publicKey, dto.nonce, dto.signature)) {
      throw new UnauthorizedException('Invalid signature');
    }

    this.nonces.delete(dto.publicKey);

    const accessToken = this.jwtService.sign({
      sub: dto.publicKey,
    });

    return { accessToken };
  }

  createNonce(publicKey: string): string {
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.nonces.set(publicKey, {
      value: nonce,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return nonce;
  }

  verifySignature(
    publicKey: string,
    message: string,
    signature: string,
  ): boolean {
    if (!publicKey || !message || !signature) {
      return false;
    }

    try {
      return Keypair.fromPublicKey(publicKey).verify(
        Buffer.from(message),
        Buffer.from(signature, 'hex'),
      );
    } catch {
      return false;
    }
  }

  private cleanupExpiredChallenges() {
    const now = Date.now();
    for (const [key, entry] of this.challenges.entries()) {
      if (now >= entry.expiresAt) {
        this.challenges.delete(key);
      }
    }
  }
}
