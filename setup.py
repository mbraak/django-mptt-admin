from setuptools import setup, find_packages

from os import path
from io import open

this_directory = path.abspath(path.dirname(__file__))
with open(path.join(this_directory, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()

version = '2.7.1'

setup(
    name='django-mptt-admin',
    version=version,
    packages=find_packages(),
    license='Apache License, Version 2.0',
    long_description=long_description,
    long_description_content_type='text/markdown',
    include_package_data=True,
    zip_safe=False,
    author='Marco Braak',
    author_email='marco.braak@planet.nl',
    install_requires=['django-mptt'],
    description='Django-mptt-admin provides a nice Django Admin interface for Mptt models',
    url='https://github.com/mbraak/django-mptt-admin',
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Framework :: Django",
        "Framework :: Django :: 4.2",
        "Framework :: Django :: 5.0",
        "Framework :: Django :: 5.1",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: Implementation :: CPython"
    ]
)
