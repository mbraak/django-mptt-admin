from setuptools import setup, find_packages


version = '0.1.5'

setup(
    name='django-mptt-admin',
    version=version,
    packages=find_packages(),
    license='Apache License, Version 2.0',
    include_package_data=True,
    zip_safe=False,
    author='Marco Braak',
    author_email='mbraak@ridethepony.nl',
    install_requires=['six==1.3.0'],
    description='Django-mptt-admin provides a nice Django Admin interface for Mptt models',
    long_description=open('README.md').read(),
)