import { describe, it, expect } from '@jest/globals';
import { moderateContent, isSpam, filterProfanity } from '../content-moderation';

describe('Content Moderation', () => {
  describe('moderateContent', () => {
    it('should allow normal messages', () => {
      const result = moderateContent('Hello, how are you doing today?');
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block phone numbers', () => {
      const result = moderateContent('Call me at 555-123-4567');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('prohibited content');
    });

    it('should block email addresses', () => {
      const result = moderateContent('Email me at test@example.com');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('prohibited content');
    });

    it('should block profanity', () => {
      const result = moderateContent('This is fucking bullshit');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('prohibited content');
    });

    it('should block payment requests', () => {
      const result = moderateContent('Send me money on Venmo');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('prohibited content');
    });

    it('should warn about suspicious patterns', () => {
      const result = moderateContent('Let\'s meet at my place');
      expect(result.allowed).toBe(true);
      expect(result.warning).toBeDefined();
    });
  });

  describe('isSpam', () => {
    it('should detect repetitive messages', () => {
      const spam = 'hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello';
      expect(isSpam(spam)).toBe(true);
    });

    it('should detect excessive caps', () => {
      const spam = 'HELLO THIS IS A VERY LOUD MESSAGE WITH LOTS OF CAPS';
      expect(isSpam(spam)).toBe(true);
    });

    it('should allow normal messages', () => {
      const normal = 'Hey, I saw your profile and would love to chat!';
      expect(isSpam(normal)).toBe(false);
    });
  });

  describe('filterProfanity', () => {
    it('should filter profanity with asterisks', () => {
      const filtered = filterProfanity('This is fucking great');
      expect(filtered).toBe('This is ******* great');
    });

    it('should preserve non-profane text', () => {
      const filtered = filterProfanity('This is great');
      expect(filtered).toBe('This is great');
    });
  });
});
