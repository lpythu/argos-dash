import os
import unittest
from unittest.mock import patch
from uuid import uuid4

from fastapi import HTTPException

from auth import session_cookie, user_id_from_cookie
from config import secret_key


class SessionSecurityTests(unittest.TestCase):
    def test_missing_or_short_session_secret_fails_closed(self):
        for value in ("", "change-me", "short"):
            with self.subTest(value=value), patch.dict(os.environ, {"DASH_SECRET": value}):
                with self.assertRaises(RuntimeError):
                    secret_key()

    def test_rotating_signing_key_revokes_existing_cookies(self):
        user_id = uuid4()
        with patch.dict(os.environ, {"DASH_SECRET": "a" * 64}):
            cookie = session_cookie(user_id)
            self.assertEqual(user_id_from_cookie(cookie), user_id)
        with patch.dict(os.environ, {"DASH_SECRET": "b" * 64}):
            with self.assertRaises(HTTPException):
                user_id_from_cookie(cookie)
            self.assertEqual(user_id_from_cookie(session_cookie(user_id)), user_id)
