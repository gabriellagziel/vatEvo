#!/usr/bin/env python3
"""
Database Connection Health Check

This script tests database connectivity without exposing secrets.
It can be used for health checks, deployment verification, and debugging.

Usage:
    python ops/db/check_connection.py
    python ops/db/check_connection.py --url postgresql://user:pass@host/db
"""

import os
import sys
import argparse
import time
from typing import Optional
from urllib.parse import urlparse

try:
    import psycopg
    from psycopg import OperationalError
except ImportError:
    print("❌ psycopg not installed. Run: pip install psycopg[binary]")
    sys.exit(1)


def parse_database_url(url: str) -> dict:
    """Parse database URL into connection parameters."""
    parsed = urlparse(url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'database': parsed.path.lstrip('/'),
        'user': parsed.username,
        'password': parsed.password,
        'sslmode': 'require' if 'sslmode=require' in url else 'prefer'
    }


def test_connection(url: str, timeout: int = 5) -> dict:
    """Test database connection with timeout."""
    start_time = time.time()
    
    try:
        # Parse connection parameters
        params = parse_database_url(url)
        
        # Test connection
        with psycopg.connect(url, connect_timeout=timeout) as conn:
            with conn.cursor() as cur:
                # Test basic query
                cur.execute("SELECT version();")
                version = cur.fetchone()[0]
                
                # Test database exists
                cur.execute("SELECT current_database();")
                db_name = cur.fetchone()[0]
                
                # Test current user
                cur.execute("SELECT current_user;")
                user = cur.fetchone()[0]
                
                connection_time = time.time() - start_time
                
                return {
                    'status': 'success',
                    'connection_time': round(connection_time, 3),
                    'database': db_name,
                    'user': user,
                    'version': version,
                    'host': params['host'],
                    'port': params['port']
                }
                
    except OperationalError as e:
        return {
            'status': 'error',
            'error': str(e),
            'connection_time': time.time() - start_time
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': f"Unexpected error: {str(e)}",
            'connection_time': time.time() - start_time
        }


def main():
    parser = argparse.ArgumentParser(description='Test database connection')
    parser.add_argument('--url', help='Database URL to test')
    parser.add_argument('--timeout', type=int, default=5, help='Connection timeout in seconds')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Get database URL
    if args.url:
        url = args.url
    else:
        url = os.getenv('POSTGRES_URL') or os.getenv('DATABASE_URL')
        if not url:
            print("❌ No database URL provided. Set POSTGRES_URL or DATABASE_URL environment variable.")
            sys.exit(1)
    
    if args.verbose:
        print(f"🔍 Testing connection to: {url.split('@')[1] if '@' in url else url}")
    
    # Test connection
    result = test_connection(url, args.timeout)
    
    if result['status'] == 'success':
        print("✅ Database connection successful")
        if args.verbose:
            print(f"   Database: {result['database']}")
            print(f"   User: {result['user']}")
            print(f"   Host: {result['host']}:{result['port']}")
            print(f"   Connection time: {result['connection_time']}s")
            print(f"   PostgreSQL version: {result['version']}")
        sys.exit(0)
    else:
        print("❌ Database connection failed")
        if args.verbose:
            print(f"   Error: {result['error']}")
            print(f"   Connection time: {result['connection_time']}s")
        sys.exit(1)


if __name__ == '__main__':
    main()
